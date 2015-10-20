queue()
	.defer(d3.json, '../data/parsed/calls.json')
	.await(makeDiag)

var h = 200, w = 800

var svg = d3.select('body').append('svg')
			.attr('height', h).attr('width',w)


function makeDiag(err, calls) {
	var max = d3.max(calls, function(call) {
		return call.value
	})
	var min = d3.min(calls, function(call) {
		return call.value
	})

	var yscale = d3.scale.linear().domain([min,max]).range([0,h])


	var timeDomain = d3.extent(calls, function(d) { return d.date })
	console.log(timeDomain)
	var timeScale = d3.time.scale().domain([new Date(timeDomain[0]),new Date(timeDomain[1])]).range([0,w])

	var drag = d3.behavior.drag();

	var bars = svg
				.selectAll('rect')
				.data(calls)
				.enter()
				.append('rect')
				.attr('x',function(d, i) {
					return timeScale(new Date(d.date))
				})
				.attr('class','bar')
				.style('y', function(d) {
					return h - yscale(d.value)
				})
				.style('height',function(d) {
					return yscale(d.value)
				})
				.style('width',2+'px')
				.style('color', 'blue')
				.call(drag)

	var axisScale = d3.scale.linear().domain([max,min]).range([0,h]);

	var yAxis = d3.svg.axis().scale(axisScale).orient("left").ticks(5)
	svg.append('g').attr('class','axis')
	.call(yAxis)

	var xAxis = d3.svg.axis().scale(timeScale).orient('bottom').ticks(d3.time.week, 4)
	svg.append('g').attr('transform','translate(0,'+h+')').attr('class','axis').call(xAxis)

}