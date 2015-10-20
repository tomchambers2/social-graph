var h = 500, w = 500

d3.json('../data/parsed/types.json', function(err, data) {
	var svg = d3.select('body').append('svg').attr({ height: h, width: w })

	svg
		.selectAll('rect')
		.data(data)
		.enter()
		.append('rect')
		.attr('x', function(d) {
			return xscale(d.value)
		})
		.attr('y', function(d) {
			return yscale(d.value)
		})
		.attr('height', function(d) {
			return yscale(d.value)	
		})
		.attr('width', function(d) {
			return w / data.length
		})
})