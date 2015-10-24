var h = 500, w = 500

var color = d3.scale.category20()

var svg = d3.select("body")
                .append("svg")
                .attr({ height: h, width: w })

queue()
    .defer(d3.json, "data/parsed/nodes.json")
    .defer(d3.json, "data/parsed/links.json")
    .await(makeDiag);

//create party ({ start, links, nodes, party_stack, size, diversity })
    //get nodes that are connected to the last node or starting node
    //remove nodes that already exist in party_stack
    //sort nodes by weight - using diversity parameter
    //return the top node and add it to the party_stack
    //if party_stack > size, return party_stack
    //else return party()

function mungeParty(data) {
    data.nodes = data.nodes.map(function(node) {
        node.links = {}
        return node
    })

    data.links = data.links.forEach(function(link) {
        data.nodes[link.target].links[link.source] = { index: link.source, score: link.value }
        data.nodes[link.source].links[link.target] = { index: link.target, score: link.value }
    })

    return data.nodes
}

function createParty(nodesInput, params) {
    var nodes = _.cloneDeep(nodesInput)
    var lastMember = _.last(params.partyStack)
    var links = nodes[lastMember].links
    var filteredLinks = _.filter(links, function(link) { if (params.partyStack.indexOf(link.index)<0) { return true } })
    var sortedLinks = _.sortBy(filteredLinks, 'score').reverse() //sort node's links by score
    params.partyStack.push(sortedLinks[0].index) //add that link

    if (params.partyStack.length >= params.size) {
        var namedParty = params.partyStack.map(function(index) {
            return nodes[index].name
        })
        return namedParty
    }
    return createParty(nodes, params)
}

function makeDiag(error, nodeData, links, table) {
    links = links.filter(function(link) {
        if (link.value) return true
    })

    var linksCopy = _.cloneDeep(links)
    var nodesCopy = _.cloneDeep(nodeData)

    var partyData = mungeParty({ nodes: nodesCopy, links: linksCopy })

    var scale = d3.scale.linear().domain([0,5]).range([300,0])
    var linescale = d3.scale.pow().domain([0,5]).range([0,5])

    var edges = svg.selectAll("line")
                    .data(links)
                    .enter()
                    .append("line")
                    .style("stroke", "#ccc")
                    .style("stroke-width", function(d) {
                        if (d.value<3) return 0
                        return 1
                        console.log(d.value,linescale(d.value))
                        return linescale(d.value)
                    })
                    .style('opacity', function(d) {
                        return d.value / 10
                    })

    var force = d3.layout.force()
                    .nodes(nodeData)
                    .links(links)
                    .size([w,h])
                    .linkDistance(function(d) { 
                        if (d.value == 0) return null
                        return scale(d.value)
                    })
                    .charge(-2000)
                    .linkStrength(1)
                    .gravity(1)
                    .start();

    var texts = svg.selectAll("text")
                    .data(nodeData)
                    .enter()
                    .append("text")
                    .attr("fill", "black")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "10px")
                    .text(function(d) { return d.name; });

    var nodes = svg.selectAll("circle")
                    .data(nodeData)
                    .enter()
                    .append("circle")
                    .attr("r", function(d,i) { return 20 })
                    .attr("opacity", 0.7)
                    .style("fill", function(d,i) { 
                        return color(i); 
                    })
                    .style('stroke', function(d) {
                        if (d.selected) return 'black'
                    })
                    .on('click', function(d, i) {
                        var party = createParty(partyData, { partyStack: [i], size: 5 })
                        console.log(party)
                        nodes.style('stroke', function(e,j) {
                            if (i===j) return 'black'
                        })
                        d3.event.stopPropagation()
                    })
                    .call(force.drag);

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