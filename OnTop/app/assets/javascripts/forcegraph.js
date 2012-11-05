//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
// configuration for our graph object
// set constants here
var config = new Object();
config.node.fill.color.fresh;
config.node.fill.color.visited;
config.node.radius;
config.node.stroke.width;

config.node.stroke.color.fresh;
config.node.stroke.color.visited;

config.link.visited;
config.link.fresh;
config.link.width;

// constructor
function graph(canvasid, input, conf)
{

    // define node locations given a mapping of nodes with a set of edges 
    // nodelist is a JSON object, parse into the graph object
    var numnodes = nodes.length();

    var canvas = document.getElementById(canvasid);

    // create a Kinetic stage to draw on
    this.stage = new Kinetic.Stage({
        container: canvasid,
        width: canvas.width,
        height: canvas.height
    });

    // create three Kinetic layers
    // links, nodes, and tool tips 
    var linksLayer = new Kinetic.Layer();
    var nodesLayer = new Kinetic.Layer();
    var tipsLayer = new Kinetic.Layer();

    this.nodes = new Array();
    this.edges = input.edges;

    // initialize the positions and velocities of each node in the graph
    for(i = 0; i < numnodes; i++) 
    {
        
        // initialize each node as a Kinetic object 
        this.nodes[i] = new Kinetic.Circle({
            x: Math.floor(Math.random()*canvas.width);
            y: Math.floor(Math.random()*canvas.height);
            radius: conf.node.radius,
            fill: conf.node.fill.color.fresh,
            stroke: conf.node.stroke.color.fresh,
            strokeWidth: conf.node.stroke.width,
            vx: 0,
            vy: 0,
            keyword: input[i].keyword,
            fixed: "false"
        });

        // add the object to the node layer
        nodesLayer.add(this.nodes[i]);

        // create a text to overlay on this node
        

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
            can: {edge.keyword1.x, edge.keyword1.y, edge.keyword2.x, edge.keyword2.y},
            stroke: conf.link.fresh,
            strokeWidth: conf.link.width,
        });

        linksLayer.add(link);
   
    }

    // finish up
    this.stage.add(linksLayer);
    this.stage.add(nodesLayer);
    this.stage.add(tipsLayer);

    
}


function updateForce()
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
        if (n.fixed == "true") continue;
        
        // damp node's movement
        n.vx = (node.vx + n.fx)*this.dampening;
        n.vy = (node.vy + n.fy)*this.dampening;        
        n.x = node.x + node.vx;
        n.y = node.y + node.vy;
        total_energy = total_energy + node.charge*(node.vx^2 * node.vy^2);

    }

    // return our total graph energy
    return total_energy;

}

function constrain(down, x, up) {

    if(x > up) return up;
    if(x < down) return down;
    return x;

}

function solve()
{
    var threshold = 0.001;
    while (this.updateForce() > threshold) {}
}

function updateNodeList(nodelist) 
{
    // removes outdated nodes from the graph, inserts new nodes while 
    // attempting to maintain the structure of the old graph
    numnodes = nodelist.length();

    // initialize a new graph
    updated = new graph(nodelist);

    // for each node in the nodelist that matches a node in the old graph
    // set positions
    for (node in updated.nodes)
    {
        
        // if the existing graph contains our points
        for (old_node in this.nodes)
        {

            if(node.keyword = old_node.keyword)
            {
                // set the points to their old coordinates
                node.x = old_node.x;
                node.y = old_node.y;
                
                break;
            }

        }


    }

}







