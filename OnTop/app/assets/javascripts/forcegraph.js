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
function graph(canvasid, nodelist, conf)
{

    // define node locations given a mapping of nodes with a set of edges 
    // nodelist is a JSON object, parse into the graph object
    var input = JSON.parse(nodelist);
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

    // initialize the positions and velocities of each node in the graph
    for(i = 0; i < numnodes; i++) 
    {
        
        // initialize each node as a Kinetic object 
        this.nodes[i] = new Kinetic.Circle({
            x: Math.floor(Math.random()*canvas.width);
            y: Math.floor(Math.random()*canvas.height);
            radius: conf.node.radius,
            fill: conf.node.fill.color.fresh,
            stroke: conf.stroke.color.fresh,
            strokeWidth: conf.node.stroke.width,
            vx: 0,
            vy: 0,
            keyword: input[i].keyword
        });

        // set default charge; we can set the charge of a node to further
        // distance it from the other nodes
        this.nodes[i].charge = 1;
        
        // swap out the keyword string in our edges list for actual node objects
        for (edge in input.edges)
        {
            
            var j = 0;

            // find the appropriate node
            for (; j < numnodes; j++)
            {
                if (edge.keyword == this.nodes[j].keyword) 
                {
                    edge.keyword = this.nodes[j];
                }
            
            }

            if (typeof edge.keyword == "string")
                alert("Error: keyword to node conversion failed.");
            
        }

    }

}

function updateForce()
{
    // calculate the total kinetic energy
    var total_energy = 0;
    var dx = 0;
    var dy = 0;
    var F = 0;
    var dist = 0;
    var theta = 0;

    // run for each node
    for (node in this.nodes) 
    {
        net_force_x = 0;
        net_force_y = 0;

        // attempt to separate nodes using Coloumb's Law
        for (other_node in this.nodes) 
        {
            // skip if this is the same node
            if (other_node.keyword == node.keyword)
            {
                continue;
            }

            // otherwise, calculate F
            dx = node.x - other_node.x;
            dy = node.y - other_node.y;
            theta = Math.atan(dy/dx);
            dist = dx*dx + dy*dy;
            F = this.colconst*node.charge*other_node.charge/dist;

            // distribute F to x and y directions
            net_force_y = net_force_y + F*Math.sin(theta);
            net_force_x = net_force_x + F*Math.cos(theta);

        }

        // attempt to connect linked nodes using Hooke's Law 
        for (edge in node.edges)
        {

            dx = node.x - edge.keyword.x;
            dy = node.y - edge.keyword.y;
            theta = Math.atan(dy/dx);
            dist = Math.sqrt(dx*dx + dy*dy);
            F = -this.springk*(dist - 1 + metric);
            
            // distribute F to x and y directions
            net_force_y = net_force_y + F*Math.sin(theta);
            net_force_x = net_force_x + F*Math.cos(theta);

        }

        // damp node's movement
        node.vx = (node.vx + timestep*net_force_x)*dampening;
        node.vy = (node.vy + timestep*net_force_y)*dampening;        
        node.x = node.x + node.vx*timestep;
        node.y = node.y + node.vy*timestep;
        total_energy = total_energy + node.charge*(node.vx^2 * node.vy^2);

    }

    // return our total graph energy
    return total_energy;

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







