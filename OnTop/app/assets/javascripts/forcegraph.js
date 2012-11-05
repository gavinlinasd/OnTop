//////////////////////
/* GLOBAL VARIABLES */
//////////////////////

// constructor
function graph(canvasid, input, conf)
{

    this.bounds = {left: Number.NEGATIVE_INFINITY, right: Number.POSITIVE_INFINITY, 
                   up: Number.NEGATIVE_INFINITY, down: Number.POSITIVE_INFINITY};

    this.dampening = 0.9;
    this.attraction = 0.06;
    this.replusion = 140;

    // define node locations given a mapping of nodes with a set of edges 
    // nodelist is a JSON object, parse into the graph object
    console.log(input.nodes.length);
    var numnodes = input.nodes.length;

    var canvas = document.getElementById(canvasid);

    // create a Kinetic stage to draw on
    this.stage = new Kinetic.Stage({
        container: canvasid,
        width: canvas.width,
        height: canvas.height
    });

    // create three Kinetic layers
    // links, nodes, and tool tips 
    this.linksLayer = new Kinetic.Layer();
    this.nodesLayer = new Kinetic.Layer();
    this.tipsLayer = new Kinetic.Layer();

    this.nodes = new Array();
    this.edges = input.edges;

    // initialize the positions and velocities of each node in the graph
    for(i = 0; i < numnodes; i++) 
    {

        var current = this.nodes[i];
        
        // initialize each node as a Kinetic object 
        current = new Kinetic.Circle({
            x: Math.floor(Math.random()*canvas.width),
            y: Math.floor(Math.random()*canvas.height),
            radius: conf.node.radius,
            fill: conf.node.fill.color.fresh,
            stroke: conf.node.stroke.color.fresh,
            strokeWidth: conf.node.stroke.width,
            vx: 0,
            vy: 0,
            keyword: input.nodes[i].keyword,
            fixed: false
        });

        // add the object to the node layer
        this.nodesLayer.add(current);

        // create a text to overlay on this node
        var tip = new Kinetic.Text({
            text: current.keyword,
            fontFamily: 'Calibri',
            fontSize: 14,
            padding: 5,
            textFill: 'black',
            visible: true,
            node: current
        });

        tip.setPosition(current.x - tip.getWidth()/2, current.y - tip.getHeight()/2); 

        this.tipsLayer.add(tip);

    }
        
    // add edges to each node
    // swap out the keyword string in our edges list for actual node objects
    for (edge in this.edges)
    {
            
        var j;

        if (edge.keyword1 == edge.keyword2)
            alert("Error: key shares edge with self. " + edge.keyword1);

        // find the appropriate node
        for (j = 0; j < numnodes; j++)
        {
            if (edge.keyword1 == this.nodes[j].keyword) 
                edge.keyword1 = this.nodes[j];
            
            if (edge.keyword2 == this.nodes[j].keyword)
                edge.keyword1 = this.nodes[j];
            
        }

        if (typeof edge.keyword1 == "string")
            alert("Error: keyword to node conversion failed. " + edge.keyword);

        if (typeof edge.keyword2 == "string")
            alert("Error: keyword to node conversion failed. " + edge.keyword);
     
        // construct and add a visible link between the two nodes
        var link = new Kinetic.Line({
            can: [edge.keyword1.x, edge.keyword1.y, edge.keyword2.x, edge.keyword2.y],
            stroke: conf.link.fresh,
            strokeWidth: conf.link.width,
        });

        this.linksLayer.add(link);
   
    }

    // finish up
    this.stage.add(this.linksLayer);
    this.stage.add(this.nodesLayer);
    this.stage.add(this.tipsLayer);

    this.render 


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

    // Coloumb's Law  for each node
    for (node in this.nodes) 
    {
        node.fx = 0;
        node.fy = 0;

        // attempt to separate nodes using Coloumb's Law
        for (other_node in this.nodes) 
        {
            // skip if this is the same node
            if (other_node.keyword == node.keyword) continue;

            // otherwise, calculate F
            dx = node.x - other_node.x;
            dy = node.y - other_node.y;
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
    for (edge in graph.edges)
    {

        var u = edge.keyword1;
        var v = edge.keyword2;

        u.fx += this.attraction*(u.x - v.x);
        u.fy += this.attraction*(u.y - v.y);
        v.fx += this.attraction*(v.x - u.x);
        v.fx += this.attraction*(v.y - u.y);

    }

    // update each node's movement based on applied forces
    for (n in this.nodes) {
        
        // skip fixed nodes
        if (n.fixed == true) continue;
        
        // damp node's movement
        n.vx = (node.vx + n.fx)*this.dampening;
        n.vy = (node.vy + n.fy)*this.dampening;        
        n.x = node.x + node.vx;
        n.y = node.y + node.vy;
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





