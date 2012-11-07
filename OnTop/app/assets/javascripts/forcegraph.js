//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

// constructor
function graph(stage, input, conf)
{

    this.bounds = {left: Number.NEGATIVE_INFINITY, right: Number.POSITIVE_INFINITY, 
                   up: Number.NEGATIVE_INFINITY, down: Number.POSITIVE_INFINITY};

    this.dampening = 0.9;
    this.attraction = 0.06;
    this.repulsion = 140;

    // define node locations given a mapping of nodes with a set of edges 
    // nodelist is a JSON object, parse into the graph object
    var numnodes = input.nodes.length;

    // create three Kinetic layers
    // links, nodes, and tool tips 
    var linksLayer = new Kinetic.Layer();
    var nodesLayer = new Kinetic.Layer();
    var tipsLayer = new Kinetic.Layer();

    this.nodes = new Array();
    this.edges = input.edges;

    var width = stage.getWidth();
    var height = stage.getHeight();

    // initialize the positions and velocities of each node in the graph
    for(i = 0; i < numnodes; i++) 
    {

        // initialize each node as a Kinetic object 
        this.nodes[i] = new Kinetic.Circle({
            x: Math.floor(Math.random()*width),
            y: Math.floor(Math.random()*height),
            radius: conf.node.radius,
            fill: conf.node.fill.color.fresh,
            stroke: conf.node.stroke.color.fresh,
            strokeWidth: conf.node.stroke.width,
            fixed: false
        });

        this.nodes[i].vx = 0;
        this.nodes[i].vy = 0;
        this.nodes[i].keyword = input.nodes[i].keyword;

        // add the object to the node layer
        nodesLayer.add(this.nodes[i]);

        // create a text to overlay on this node
        var tip = new Kinetic.Text({
            text: input.nodes[i].keyword,
            fontFamily: 'Calibri',
            fontSize: 14,
            padding: 5,
            textFill: 'black',
            visible: true,
            node: this.nodes[i]
        });

        tip.setPosition(this.nodes[i].attrs.x - tip.getWidth()/2, this.nodes[i].attrs.y - tip.getHeight()/2); 

        tipsLayer.add(tip);

    }
       
    var numedges = input.edges.length;

    // add edges to each node
    // swap out the keyword string in our edges list for actual node objects
    var e = 0; 
    for (e = 0; e < numedges; e++)
    {
            
        var edge = input.edges[e];


        if (edge.key1 == edge.key2)
            alert("Error: key shares edge with self. " + edge.key1);

        // find the appropriate node

        var j;
        for (j = 0; j < numnodes; j++)
        {

            if (edge.key1 == this.nodes[j].keyword) 
                edge.key1 = this.nodes[j];
            
            if (edge.key2 == this.nodes[j].keyword)
                edge.key2 = this.nodes[j];
            
        }

        if (typeof edge.key1 == "string")
            alert("Error: keyword to node conversion failed. " + edge.key1);

        if (typeof edge.key2 == "string")
            alert("Error: keyword to node conversion failed. " + edge.key2);
     
        // construct and add a visible link between the two nodes
        var link = new Kinetic.Line({
            points: [{x: edge.key1.attrs.x, y: edge.key1.attrs.y}, {x: edge.key2.attrs.x, y: edge.key2.attrs.y}],
            stroke: conf.link.fresh,
            strokeWidth: conf.link.width,
        });

        linksLayer.add(link);
   
    }

    // finish up
    // add new layers
    stage.add(linksLayer);
    stage.add(nodesLayer);
    stage.add(tipsLayer);


}

// updates the graph with a single calculation of applied forces
graph.prototype.step = function ()
{
    // calculate the total kinetic energy
    var total_energy = 0;
    var dx = 0;
    var dy = 0;
    var F = 0;
    var dist = 0;
    //var theta = 0;
    var n;
    var e;
    var numnodes = this.nodes.length;
    var numedges = this.edges.length;

    // Coloumb's Law  for each node
    for (n = 0; n < numnodes; n++) 
    {

        var node = this.nodes[n];

        node.fx = 0;
        node.fy = 0;

        // attempt to separate nodes using Coloumb's Law
        var o = 0;
        for (o = 0; o < numnodes; o++) 
        {
            var other_node = this.nodes[o];

            // skip if this is the same node
            if (other_node.keyword == node.keyword) continue;

            // otherwise, calculate F
            dx = node.attrs.x - other_node.attrs.x;
            dy = node.attrs.y - other_node.attrs.y;
            //theta = Math.atan(dy/dx);
            dist = dx*dx + dy*dy;
            if (dist==0) dist = 0.001;

            F = this.repulsion/dist;

            // distribute F to x and y directions
            node.fx += F*dx;
            node.fy += F*dy;

        }

    }
        
    // attempt to connect linked nodes using Hooke's Law 
    for (e = 0; e < numedges; e++)
    {

        var edge = this.edges[e];

        var u = edge.key1;
        var v = edge.key2;
        var au = edge.key1.attrs;
        var av = edge.key2.attrs;

        u.fx -= this.attraction*(au.x - av.x);
        u.fy -= this.attraction*(au.y - av.y);
        v.fx -= this.attraction*(av.x - au.x);
        v.fx -= this.attraction*(av.y - au.y);

    }

    // update each node's movement based on applied forces
    var n;
    for (n = 0; n < numnodes; n++) 
    {

        var node = this.nodes[n];

        // skip fixed nodes
        if (node.fixed == true) continue;
        
         // damp node's movement
        node.vx = (node.vx + node.fx)*this.dampening;
        node.vy = (node.vy + node.fy)*this.dampening;   
        node.attrs.x = node.attrs.x + node.vx;
        node.attrs.y = node.attrs.y + node.vy;
        total_energy = total_energy + (node.vx^2 * node.vy^2);

    }

    // return our total graph energy
    return total_energy;

}

// iterates through force update steps until the graph is stable
graph.prototype.solve = function(threshold, iterations)
{
    while (this.step() > threshold && iterations > 0) {iterations--;}
}

function constrain(down, x, up) {

    if(x > up) return up;
    if(x < down) return down;
    return x;

}





