var h = 500, w = 1000

var color = d3.scale.category20()

var svg = d3.select("body")
                .append("svg")
                .attr({ height: h, width: w })

queue()
    .defer(d3.json, "nodes.json")
    .defer(d3.json, "links.json")
    .await(makeDiag);


function makeDiag(error, nodes, links, table) {
    links = links.filter(function(link) {
        if (link.value) return true
    })

    var scale = d3.scale.linear().domain([0,5]).range([300,0])
    var linescale = d3.scale.pow().domain([0,5]).range([0,5])

    var edges = svg.selectAll("line")
                    .data(links)
                    .enter()
                    .append("line")
                    .style("stroke", "#ccc")
                    .style("stroke-width", function(d) {
                        return 1
                        console.log(d.value,linescale(d.value))
                        return linescale(d.value)
                    })

    /* Establish the dynamic force behavor of the nodes */
    var force = d3.layout.force()
                    .nodes(nodes)
                    .links(links)
                    .size([w,h])
                    .linkDistance(function(d) { 
                        if (d.value == 0) return null
                        return scale(d.value)
                    })
                    .charge(-2000)
                    //.linkStrength(0.5)
                    .gravity(1)
                    .start();
    /* Draw the edges/links between the nodes */
    var texts = svg.selectAll("text")
                    .data(nodes)
                    .enter()
                    .append("text")
                    .attr("fill", "black")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "10px")
                    .text(function(d) { return d.name; });

    var nodes = svg.selectAll("circle")
                    .data(nodes)
                    .enter()
                    .append("circle")
                    .attr("r", function(d,i) { return 20 })
                    .attr("opacity", 0.7)
                    .style("fill", function(d,i) { return color(i); })
                    .call(force.drag);

    /* Draw the nodes themselves */                

    /* Run the Force effect */
    force.on("tick", function() {
               edges.attr("x1", function(d) { return d.source.x; })
                    .attr("y1", function(d) { return d.source.y; })
                    .attr("x2", function(d) { return d.target.x; })
                    .attr("y2", function(d) { return d.target.y; });

               nodes.attr("cx", function(d) { return d.x; })
                    .attr("cy", function(d) { return d.y; })

               texts.attr("transform", function(d) {
                        return "translate(" + (d.x - 12.5) + "," + (d.y + 5) + ")";
                });
                    
               
            });
};