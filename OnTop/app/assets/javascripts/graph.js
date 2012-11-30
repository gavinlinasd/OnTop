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
        .charge(config.charge)
        .linkDistance(function(d) {

            // compute a desired link distance from the configuration 
            // parameters and the link metric
            var m = 1 - d.metric;
            return config.basedist + m*config.distrange;

        })
        .size(config.size);

    svg = d3.select(container).append("svg")
        .attr("width", this.conf.width)
        .attr("height", this.conf.height);    

    // add an initially invisible info box to the graph


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

        // move the center node towards the anchor
        var k = e.alpha/10;

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

    });

}

// build the graph using ajax requests
// recursive call back function
graph.prototype.asyncBuild = function(keyword, keep) {

    // keep a pointer to our graph
    var self = this;

    // initialize our variables
    var oldhash = new Object();
    if (keep) oldhash = this.hash;

    this.hash = new Object();
    var keyqueue = new Array();
    var partial = new Object();
    partial.nodes = new Array();
    partial.links = new Array();

    var root = new Object();
    if (oldhash[keyword]) {
        root = oldhash[keyword];
    } else {
        root.x = this.conf.width/2;
        root.y = this.conf.height/2;
        root.keyword = keyword;
    }

    root.cost = 0;
    
    keyqueue.push(root);

    // make a recursive call to the helper function to build the graph
    $.ajax();


}

// used to pass our own variables into the call back
graph.prototype.asyncBuildHelper = function(path, oldhash, newhash, queue, partial) {

    return function(data) {

        // we still need to remove the first item from the queue
        var cur = queue.shift();

        // data holds our related keywords
        // make nodes for them, if close enough
        // add them to the queue that we pass on, if new
        



        // if the queue is empty, the graph is complete
        // build it
        if (queue.length < 1)
            createJSON(partial);

        // otherwise, pop another entry from the queue
        // and query it
        var next = queue[0].keyword;

        $.ajax({
            url: path,
            data: next,
            dataType: "json",
            success: asyncBuildHelper(path, hash, queue, partial)
        });

        // exit without returning anything, the next step of the
        // algorithm will continue in the ajax callback

    };

}


// generic helper function that accepts a starting node keyword
// and a boolean that denotes whether we should preserve the 
// any existing nodes
graph.prototype.update = function(startkeyword, keep) {

    // save old nodes for reference
    // this allows us to overwrite this.hash if passed in
    var oldhash = new Object();
    if (keep) oldhash = this.hash;
    // create a new hash table to map keywords to node objects
    this.hash = new Object();

    var tovisit = new Array();
    var partial = new Object();
    partial.nodes = new Array();
    partial.links = new Array();

    var root = new Object();
    if (oldhash[keyword]) {
        root = oldhash[keyword];
    } else {
        root.x = this.conf.width/2;
        root.y = this.conf.height/2;
        root.keyword = keyword;
    }

    root.cost = 0;

    tovisit.push(root);

    // construct our graph
    // until we run out of nodes that aren't too costly to add
    while(tovisit.length > 1) {

        // pop a node from the queue
        var cur = tovisit.pop();
        cur.connected = new Array();

        // if our node's cost is too high, skip it
        if (cur.cost > this.conf.addThresh) continue;

        // add the node to the partial
        partial.nodes.push(cur);
        // save to hash
        hash[cur.keyword] = cur;

        // ask the model controller for related keywords
        // this function should return a list of objects,
        // each containing a metric and a keyword
        var related = this.getRelated(cur.keyword);

        // iterate through list and calculate the cost for the other node
        // if its cost is low, add it to the tovisit queue and
        // and add the link to our graph
        for (conn in related) {

            // holder for the connecting nodes
            var other = null;
            var costfromhere = cur.cost + 1;

            // check if the other node already exists
            // if so use that
            if (this.hash[conn.keyword]) 
            {
                
                other = this.hash[conn.keyword];
                // if the cost to the node is less from here, update
                if (other.cost > costfromhere)
                    other.cost = costfromhere;

            }
            // next check if it's in the old hash (if we kept it)
            else if (oldhash[conn.keyword])
            {

                other = oldhash[conn.keyword];
                // we don't keep the cost from the old hash
                other.cost = costfromhere;

            }
            // if the node doesn't exist and it's too costly to create, skip it
            else if (costfromhere > this.conf.addThresh) continue;
            // otherwise, create a new node and add it to the graph
            else {
                other = new Object();
                other.cost = costfromhere;
                other.keyword = conn.keyword;
                other.x = Math.random()*this.conf.width;
                other.y = Math.random()*this.conf.height;
                
                hash[other.keyword] = other;
                tovisit.push(other);
                partial.nodes.push(other);

            }

            // if we've made it this far, other points to a valid node 
            // add a link to the partial graph
            var link = new Object();
            link.metric = conn.metric;
            link.source = cur;
            link.target = other;

            // save the pointer to the other node
            cur.connected.push(other);

            partial.links.push(link);

        }

    }

    // return the JSON object
    return partial;

} // end of seed function

// recenters the graph on a new node and updates the graph
// loading new nodes and dropping old nodes
graph.prototype.refocus = function(keyword) {

    // assign a new center node
    center = this.hash[keyword];

    // update the graph
    var part = this.update(keyword, true);
    this.createJSON(part);

}

// generates a new graph using the keyword as root
graph.prototype.seed = function(keyword) {

    var part = this.update(keyword, false);
    this.createJSON(part);

}

// function for opening a new Wikipedia webpage in the background
function openwiki(keyword) {

    var url = "http://en.wikipedia.org/wiki/" + keyword;
    window.open(url, "_blank");

}

// opens the info box for the given node
function openinfobox(node) {





}

function closeinfobox() {

    // hide the info box


}