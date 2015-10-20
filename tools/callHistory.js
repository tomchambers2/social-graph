var parse = require('csv-parse'),
	fs = require('fs')
var transform = require('stream-transform');
var path = require('path')
var _ = require('lodash')

var log = {};

var times = {};
var types = {};

var parser = parse({ delimiter: ',' })
var transformer = transform(function(record, callback){
	var date = record[1].match(/[0-9-]+/)
	if (!date) return callback()
	if (!log[date]) {
		log[date] = 1
	} else {
		log[date]++
	}

	console.log(record[3])
	types[record[3]] = types[record[3]] ? types[record[3]] + 1 : 1

	callback()

});

var stream = fs.createReadStream(path.join(__dirname, '../', 'data/dirty/calls.csv'))

stream.pipe(parser).pipe(transformer)

stream.on('end', function(err, x) {
	//console.log(log)
	console.log(types)
	console.log('done')
})