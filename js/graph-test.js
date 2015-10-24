var h = 500, w = 500

var svg = d3.select('body')
			.append('svg')
			.attr({ height: h, width: w })

var nodes = [
	{name:'tom'},
	{name:'jim'}
]

var links = [
	{ source:0, target:1, value: 2 },
]			

function Graph(nodes, links) {
	this.nodes = nodes
	this.links = links

	this.addNode = function(name) {
		this.nodes.push({ name: name })
		this.links.push({ source: this.nodes.length - 1, target: 0 })
	}

	this.draw = function() {
		var force = d3.layout.force()
						.nodes(this.nodes)
						.links(this.links)
						.size([w,h])
						.charge(-800)
						.linkDistance('20')
						.start()

		this.nodes = svg.selectAll('circle')
					.data(this.nodes)
					.enter()
					.append('circle')
					.attr("r", '20')
					.style('fill', '#eee')

		force.on('tick', function() {
			console.log(this.nodes)
			this.nodes.attr('cx', function(d) { return d.x })
						.attr('cy', function(d) { return d.y })
		}.bind(this))
	}
}

var graph = new Graph(nodes, links)

graph.draw()
graph.addNode('bob')
