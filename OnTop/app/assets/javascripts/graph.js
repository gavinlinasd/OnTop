// graph.js
// utilizes the d3.js SVG library force layout to create graph of keywords
// graph is centered using an invisible center node with changing links
// each node

// constants and globals
var layout;
var anchor;
var center;
var link = null;
var node = null;
var svg;
var info;
var last_search;

// visited is a global hash table for storing the long term state for nodes
// either fresh, visited, or searched
var visited = new Object();

// constructor for the graph object
// initializes the d3 force layout object and svg
// controllerfunc is a function that accepts a single
// string and returns a JSON object containing a list of connected
// keywwords and the corresponding metrics
function graph(config, container, controllerfunc) {

    this.conf = config;
    this.getRelated = controllerfunc;

    layout = d3.layout.force()
        .charge(this.conf.charge)
        .linkDistance(this.conf.basedist)
        .size(this.conf.size)
        .gravity(this.conf.gravity);

    svg = d3.select(container).append("svg")
        .attr("width", this.conf.width)
        .attr("height", this.conf.height);    

    // add an initially invisible info box to the graph
    info = svg.append("g")
        .attr("class", "tooltip")
        .attr("id", "infobox");
    

    // add an anchor to float the graph towards
    anchor = new Object();
    anchor.x = this.conf.width/2;
    anchor.y = this.conf.height/2;

}

// creates a graph directly from a JSON object
// assumes the first node in the JSON object is the center
graph.prototype.createJSON = function(json, centerindex) {

    var self = this;

    // remove old elements
    //svg.selectAll("line.link").remove();
    //svg.selectAll("g.node").remove();
    if (link) link.remove();
    if (node) node.remove();

    // start the force simulation
    layout.nodes(json.nodes)
        .links(json.links)
        .start();

    link = svg.selectAll("line.link")
        .data(json.links)
        .enter().append("line")
        .classed("link", true)
        .classed("searched", function(d, i) {
            return (visited[d.source.keyword] == "searched" && visited[d.target.keyword] == "searched");
        })
        .classed("visited", function(d, i) {
            if (visited[d.source.keyword] == "visited" && visited[d.target.keyword] == "visited")
                return true;
            if (visited[d.source.keyword] == "searched" && visited[d.target.keyword] == "visited")
                return true;
            if (visited[d.source.keyword] == "visited" && visited[d.target.keyword] == "searched")
                return true;
            return false;
               
        })
        .classed("new", function(d, i) {
            return (visited[d.source.keyword] == "new" || visited[d.target.keyword] == "new");
        });

    // get rid of all previous nodes
    node = svg.selectAll("g.node")
        .data(json.nodes)
        .enter().append("g")
        .classed("node", true)
        .classed("searched", function(d, i) {
            return (visited[d.keyword] == "searched");
        })
        .classed("visited", function(d, i) {
            return (visited[d.keyword] == "visited");
        })
        .classed("new", function(d, i) {
            return (visited[d.keyword] == "new");
        });

    // add on click listeners
    node.on("click", function(d, i) {
        
        // global event handle
        var evt = d3.event;

        // step up the node state
        // if new, we simply marked it as visited
        if (visited[d.keyword] == "new") {

            // add to the search history
            visitNode(d, this);
            // add it to the search history
            AddNewNodeToSearch(last_search, d.keyword);
        }
        else // otherwise, make it searched
        {

            searchNode(d, this);
 
            // add it to the search history
            AddNewSearch(d.keyword);
            last_search = d.keyword;

            // refocus the graph
            self.refocus(d.keyword);

        }

        // if the control key is held, open the wiki page
        if(evt.ctrlKey) 
            openwiki(d.keyword);
        
    });

    // add the circle graphic to the node
    node.append("circle")
        .attr("r", this.conf.noderadius);

    // create the text that overlays each node
    node.append("text")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.display_name });

    center = node[0][centerindex];
    center.fixed = true;

    // define our tick function
    layout.on("tick", function(e) {

        return self.redraw(e.alpha, self);

    });

}

graph.prototype.changeConf = function(name, value) {

    this.conf[name] = value;

}

// redraw function for the graph
graph.prototype.redraw = function(k, self) {

    var width = self.conf.width;
    var height = self.conf.height;

    center.px += (anchor.x - center.px)*0.3;
    center.x = center.px;
    center.py += (anchor.y - center.py)*0.3;
    center.y = center.py;

    // move all the graphical elements
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { 
        if (d.x > self.conf.width) d.x = self.conf.width;
        if (d.x < 0) d.x = 0;
        if (d.y > self.conf.height) d.y = self.conf.height;
        if (d.y < 0) d.y = 0;

        return "translate(" + d.x + "," + d.y + ")"; });

}

// build the graph using ajax requests
// recursive call back function
graph.prototype.asyncUpdate = function(root) {

    // keyword: the normalized name for the root node

    // NOTE: we expect the old node hash to contain the root node already, either because 
    // this update was from a click, and thus the node was already in the visible graph
    // or the update was a search, and we expect a wrapper function to have properly
    // initialized the hash

    // keep a pointer to our graph
    var self = this;

    // initialize our variables
    // empty out our node hash 
    var oldhash = this.hash;
    this.hash = new Object();

    var partial = new Object();
    partial.nodes = new Array();
    partial.links = new Array();

    root.cost = 0;
    root.fixed = true;

    this.hash[root.keyword] = root;

    // add the root node to the nodes list
    partial.nodes.push(root);

    // wrap the root node in an array and ask the server for related entries
    var nextkeys = new Array(root.keyword);

    // make a recursive call to the helper function to build the graph
    $.ajax({
        url: self.conf.graphpath,
        data: {"keyword": nextkeys},
        dataType: "json",
        success: self.asyncUpdateHelper(oldhash, self, partial)
    });


} // end of the asyncUpdate function

// used to pass our own variables into the call back
graph.prototype.asyncUpdateHelper = function(oldhash, self, partial) {

    return function(data) {

        // if we received null data, then all the keywords were not in the database
        // alert and return
        if (data == null) {
            alert("Graph fetch missed.");
            return;
        }

        // create an array to handle the next set of keywords to lookup
        var nextkeys = new Array();

        // data holds our related keywords
        // make nodes for them, if close enough
        // add them to the queue that we pass on, if new
        var numsets = data.length;

        for (var s = 0; s < numsets; s++) {

            var set = data[s];
            var key = set.source;
            var targets = set.targets;

            // pointer to the source node
            var snode = self.hash[key];

            // the cost to get to the target from the source
            var cost = snode.cost + 1;

            // if the cost is too high, skip all children regardless
            if (cost > self.conf.removeThresh)
                break;
              
            // target refers to the normalized keyword name
            var numtargets = targets.length;
            for (var t = 0; t < numtargets; t++) {
                
                // constraint the number of nodes we load for each source
                if (t > self.conf.branchfactor)
                    break;

                var target = targets[t];

                // pointer to the source node
                var tnode = null;
                
                // check if the target node already exists
                // if so, use that
                if (self.hash[target.name]) 
                {
                    tnode = self.hash[target.name];
                    // update cost
                    if (tnode.cost > cost)
                        tnode.cost = cost;

                    // if the node's already in this hash, then it doesn't need to be 
                    // queried

                }
                else if (oldhash[target.name])
                {

                    // we don't care about the old cost
                    // if the new cost is over the remove threshold, don't add it back
                    // into the new graph
                    if (cost > self.conf.removeThresh)
                        continue;

                    tnode = oldhash[target.name];
                 
                    // update cost
                    tnode.cost = cost;
                    
                    // since the node's new, add it to the query
                    nextkeys.push(target.name);
                    tnode.fixed = false;
                    partial.nodes.push(tnode);
                    self.hash[tnode.keyword] = tnode;


                }
                // if the node doesn't exist and toocostly to create, skip it
                else if (cost > self.conf.addThresh) continue;
                // otherwise, create a new node and add it to the graph
                else
                {

                    tnode = new Object();
                    tnode.cost = cost;
                    tnode.keyword = target.name;
                    tnode.display_name = target.display_name;
                    tnode.x = snode.x;
                    tnode.y = snode.y;

                    // distinguish between the different types of nodes
                    if (visited[tnode.keyword] == null) 
                        visited[tnode.keyword] = "new";
                    
                    // save the node and add pointers to the appropriate spots
                    nextkeys.push(tnode.keyword);
                    tnode.fixed = false;
                    partial.nodes.push(tnode);
                    self.hash[tnode.keyword] = tnode;

                }

                // if we've made it this far, target points to a valid node 
                // add a link to the partial graph
                var link = new Object();
                link.source = snode;
                link.target = tnode;
                
                // save link
                partial.links.push(link);

            }

        }

        // if the queue is empty, the graph is complete
        // build it
        if (nextkeys.length < 1) {
            self.createJSON(partial, 0);
            return;
        }
        
        // otherwise, pop another entry from the queue
        // and query it

        $.ajax({
            url: self.conf.graphpath,
            data: {"keyword" : nextkeys},
            dataType: "json",
            success: self.asyncUpdateHelper(oldhash, self, partial)
        });

        // exit without returning anything, the next step of the
        // algorithm will continue in the ajax callback

    };

} // end of the asyncUpdateHelper function




// recenters the graph on a new node and updates the graph
// loading new nodes and dropping old nodes
graph.prototype.refocus = function(keyword) {

    // assign a new center node
    center = this.hash[keyword];
    
    // upgrade the node to visited, if it's fresh
    if (visited[center.keyword] !== "searched")
        visited[center.keyword] = "visited";

    // we want to maintain the position of any previous nodes, so leave the hash intact
    // update the graph
    this.asyncUpdate(center);

}

// generates a new graph using the keyword as root
graph.prototype.seed = function(query) {

    var self = this;

    // we don't care about any existing nodes, so empty the hash out
    this.hash = new Object();

    // asyncUpdate expects an initialized root node, so make a separate AJAX request
    $.ajax({
        url: self.conf.querypath,
        data: {"keyword": query},
        dataType: "json",
        success: self.asyncQueryHelper(self),
        error: function(xhr, status, error) {
            alert("Error connecting to database.");
        }
    });

}

// a helper callback function that initializes a root node from an AJAX
// response
// then calls the asyncUpdate function
graph.prototype.asyncQueryHelper = function(self) {

    return function(data) {

        // if the server returns nothing, then the entry doesn't exist
        // alert and leave everything alone
        if (data == null) {
            alert("Search query not found.");
            return;
        }

        // this is where we KNOW that the query is valid
        // add it to the search history
        AddNewSearch(data.name);
        last_search = data.name;

        // clear out the hash
        self.hash = new Object();

        // initialize a root node using the info in data
        var root = new Object();
        root.x = self.conf.width/2;
        root.y = self.conf.height/2;
        root.display_name = data.display_name;
        root.keyword = data.name;

        // remember that we searched this
        visited[root.keyword] = "searched";

        // add it to the hash
        self.hash[root.keyword] = root;

        // start the cascading AJAX calls needed to fill the graph
        self.asyncUpdate(root);

    }


}

// function for marking a node as visited, if not searched
function visitNode(node, element) {

    if (visited[node.keyword] !== "searched") {
        d3.select(element).classed("new", false);
        d3.select(element).classed("visited", true);
        visited[node.keyword] = "visited";
    }
   
}

// function for marking a node as searched
function searchNode(node, element) {

    d3.select(element).classed("new", false);
    d3.select(element).classed("visited", false);
    d3.select(element).classed("searched", true);
    visited[node.keyword] = "searched";
   
}


// function for opening a new Wikipedia webpage in the background
function openwiki(keyword) {

    var url = "http://en.wikipedia.org/wiki/" + keyword;
    window.open(url, "_blank");

}

// updates and opens the info box for the given node
function openinfobox(node) {





}

// 
function closeinfobox() {



}