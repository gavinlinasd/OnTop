// graph.js
// utilizes the d3.js SVG library force layout to create graph of keywords
// graph is centered using an invisible center node with changing links
// each node

// constants and globals
var layout;
var anchor;
var center;
var link;
var node;
var svg;
var info;

// constructor for the graph object
// initializes the d3 force layout object and svg
// controllerfunc is a function that accepts a single
// string and returns a JSON object containing a list of connected
// keywwords and the corresponding metrics
function graph(config, container, controllerfunc) {

    this.visited = new Array();
    this.conf = config;
    this.getRelated = controllerfunc;

    layout = d3.layout.force()
        .charge(this.conf.charge)
        .linkDistance(this.conf.basedist)
        .size(this.conf.size);

    svg = d3.select(container).append("svg")
        .attr("width", this.conf.width)
        .attr("height", this.conf.height);    

    // add an initially invisible info box to the graph
    info = svg.append("g")
        .attr("infobox");

    // add an anchor to float the graph towards
    anchor = new Object();
    anchor.x = this.conf.width/2;
    anchor.y = this.conf.height/2;

}

graph.prototype.setVisited = function(v) {
    this.visited = v;
}

graph.prototype.getVisited = function() {
    return this.visited;
}

// creates a graph directly from a JSON object
// assumes the first node in the JSON object is the center
graph.prototype.createJSON = function(json, centerindex) {

    var self = this;

    // start the force simulation
    layout.nodes(json.nodes)
        .links(json.links)
        .start();

    link = svg.selectAll("line.link")
        .data(json.links)
        .enter().append("line")
        .attr("class", "link")
        .attr("class", "new");

    node = svg.selectAll("circle.node")
        .data(json.nodes)
        .enter().append("g")
        .attr("class", "new");

    // add on click listeners
    node.on("click", function(d, i) {
        d3.select(this).attr("class", "visited");
        d.visited = true;

        // redraw the graph
        self.redraw(0);

    });

    // add the circle graphic to the node
    node.append("circle")
        .attr("r", this.conf.noderadius);

    // create the text that overlays each node
    node.append("text")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.keyword });

    center = node[0][centerindex];
    
    // define our tick function
    layout.on("tick", function(e) {

        return self.redraw(e.alpha);

    });

}

// redraw function for the graph
graph.prototype.redraw = function(k) {

    center.x += (anchor.x - center.x)*k;
    center.y += (anchor.y - center.y)*k;

    // move all the graphical elements
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .attr("class", function(d) {
            
            if (d.source.visited && d.target.visited)
                return "visited";
            return "new";
        });


    node.attr("transform", function(d) { 
        return "translate(" + d.x + "," + d.y + ")"; });


}

// 



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
    
    // add the root node to the nodes list
    partial.nodes.push(root);

    // wrap the root node in an array and ask the server for related entries
    var next = new Array(root);

    // make a recursive call to the helper function to build the graph
    $.ajax({
        url: self.conf.graphpath,
        data: next,
        dataType: "json",
        success: self.asyncUpdateHelper(path, hash, self, partial)
    });


} // end of the asyncUpdate function

// used to pass our own variables into the call back
graph.prototype.asyncUpdateHelper = function(oldhash, self, partial) {

    return function(data) {

        // create an array to handle the next set of keywords to lookup
        var nextkeys = new Array();

        // data holds our related keywords
        // make nodes for them, if close enough
        // add them to the queue that we pass on, if new
        for (set in data) {

            var key = set.source;

            // pointer to the source node
            var snode = self.hash[key];
            var related = set;
            
            // target refers to the normalized keyword name
            for (target in related) {
                
                // pointer to the source node
                var tnode = null;
                // the cost to get to the target from the source
                var cost = source.cost + 1;
                
                // check if the target node already exists
                // if so, use that
                if (self.hash[target]) 
                {
                    tnode = self.hash[target];
                    // update cost
                    if (tnode.cost > cost)
                        tnode.cost = cost;

                    // if the node's already in this hash, then it doesn't need to be 
                    // queried

                }
                else if (oldhash[target])
                {

                    tnode = oldhash[target];
                    // update cost
                    if (tnode.cost > cost)
                        tnode.cost = cost;

                    // since the node's new, add it to the query
                    nextkeys.push(target);


                }
                // if the node doesn't exist and toocostly to create, skip it
                else if (cost > self.conf.addThresh) continue;
                // otherwise, create a new node and add it to the graph
                else
                {

                    var nodeinfo = related[target];

                    tnode = new Object();
                    tnode.cost = cost;
                    tnode.keyword = target;
                    tnode.displayname = nodeinfo.displayname;
                    tnode.x = snode.x;
                    tnode.y = snode.y;

                    // distinguish between the different types of nodes
                    tnode.type =
                    
                    // save the node and add pointers to the appropriate spots
                    self.hash[tnode.keyword] = tnode;
                    nextkeys.push(tnode.keyword);
                    partial.nodes.push(tnode);

                }

                // if we've made it this far, other points to a valid node 
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
            self.createJSON(partial);
            return;
        }
        
        // otherwise, pop another entry from the queue
        // and query it

        $.ajax({
            url: self.conf.graphpath,
            data: next,
            dataType: "json",
            success: self.asyncUpdateHelper(hash, self, partial)
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
        data: query,
        dataType: "json",
        success: self.asyncQueryHelper(self);
    });

}

// a helper callback function that initializes a root node from an AJAX
// response
// then calls the asyncUpdate function
graph.prototype.asyncQueryHelper = function(self) {

    return function(data) {

        // clear out the hash
        self.hash = new Object();

        // initialize a root node using the info in data
        var root = new Object();
        root.x = self.conf.width/2;
        root.y = self.conf.height/2;
        root.displayname = data.displayname;
        root.keyword = data.name;

        // add it to the hash
        self.hash[root.keyword] = root;

        // start the cascading AJAX calls needed to fill the graph
        self.asyncUpdate(root);

    }


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