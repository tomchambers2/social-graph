var h = 500, w = 500

var svg = d3.select("body")
                .append("svg")
                .attr({ height: h, width: w })

var nodes = [
 {name:'tom'},
 {name:'jim'}
]

var links = [
 { source:0, target:1, value: 2 },
]

var force = d3.layout.force()
                .nodes(nodes)
                .links(links)
                .size([w,h])
                .linkDistance('20')
                .start();

var nodes = svg.selectAll("circle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("r", '20')
                .style("fill", 'red')

force.on("tick", function() {
   nodes.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
});
