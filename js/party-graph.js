var h = 500, w = 500

var color = d3.scale.category20()

var svg = d3.select("body")
                .append("svg")
                .attr({ height: h, width: w })

queue()
    .defer(d3.json, "data/parsed/nodes.json")
    .defer(d3.json, "data/parsed/links.json")
    .await(receiveData);

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

function compileParty(nodes, party) {
    var names = party.map(function(index) {
        return nodes[index].name
    })
    return { names: names, indices: party }    
}

function getNextNode(nodes, diversity, partyStack, lastMember) {
    var links = nodes[lastMember].links
    var filteredLinks = _.filter(links, function(link) { if (partyStack.indexOf(link.index)<0) { return true } })
    var mungedLinks = filteredLinks.map(function(link) { //for every link
        _.each(nodes[link.index].links, function(sublink) {
            partyStack.forEach(function(partyMember) {
                if (partyMember===sublink.index) {
                    link.score++
                }
            })
        })
        return link
    })
    var sortedLinks = _.sortBy(mungedLinks, 'score') //sort node's links by score
    
    weightedChoices = []
    for (var i = 0; i < diversity; i++) {
        weightedChoices.push(0)
    };
    for (var i = 0; i < (100 - diversity); i++) {
        weightedChoices.push(1)
    };
    if (_.sample(weightedChoices)) {
        console.log('Inverted',diversity)
        sortedLinks.reverse()
    } else {
        console.log('Not inverted',diversity)
    }

    if (!sortedLinks.length) {
        var clipLength = partyStack.length - partyStack.indexOf(lastMember)
        var prevMember = _.last(partyStack.slice(0,partyStack.length - clipLength))
        return getNextNode(nodes, diversity, partyStack, prevMember)
    }

    return sortedLinks[0].index
}

function createParty(nodesInput, params) {
    var nodes = _.cloneDeep(nodesInput)
    
    params.partyStack.push(getNextNode(nodes, params.diversity, params.partyStack, _.last(params.partyStack))) //add that link

    if (params.partyStack.length >= params.size) {
        return compileParty(nodes, params.partyStack)
    }
    return createParty(nodes, params)
}

function receiveData(err, nodes, links) {
    makeDiag(nodes, links)
}

function makeDiag(nodeData, links, size, diversity) {
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

    var size = 5
    var diversity = 100
    d3.select('#size').on('input', function(e) {
        size = this.value
    })

    d3.select('#diversity').on('input', function() {
        diversity = this.value
    })

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
                        var party = createParty(partyData, { partyStack: [i], size: size, diversity: diversity })
                        console.log(party.names)
                        nodes.style('stroke', function(e,i) {
                            if (party.indices.indexOf(i)>-1) return 'black'
                        })
                        edges.style("stroke", function(e, i) {
                            var color = "#fff"
                            if (party.indices.indexOf(e.source.index)>-1 && party.indices.indexOf(e.target.index)>-1) {
                                color = "#bbb"
                            }

                            var firstIndex = party.indices.indexOf(e.source.index)
                            var secondIndex = party.indices.indexOf(e.target.index)                                                            
                            if (firstIndex<0 || secondIndex<0) return "#fff"
                            var difference = firstIndex - secondIndex
                            console.log(firstIndex, secondIndex, difference)
                            if (difference === -1 || difference === 1) {
                                color = "#000"
                            }
                            return color
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