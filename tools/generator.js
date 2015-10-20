var fs = require('fs'),
	nodes,
	links,
	_ = require('lodash'),
	prompt = require('prompt'),
	async = require('async')

fs.readFile('nodes.json', 'utf8', function(err, data) {
	nodes = JSON.parse(data)
})

fs.readFile('links.json', 'utf8', function(err, data) {
	links = JSON.parse(data)
})

function getNewPerson() {
	prompt.get({ name: 'name', description: 'Write name of person to add to graph' }, function(err, data) {
		if (!data.name) {
			return generateLinks()
		}
		addNewPerson(data.name)
	})
}

function writeNodes(nodes) {
	fs.writeFile('nodes.json', JSON.stringify(nodes))
}

function writeLinks(links) {
	fs.writeFile('links.json', JSON.stringify(links))
}


function addNewPerson(name) {
	nodes.push({ name: name })
	writeNodes(nodes)
	process.stdin.write('Added new person ' + name + '\n')
	generateLinks()
}

function generateLinks() {
	async.forEachOfSeries(nodes, function(outerNode, outerIndex, outerCb) {
		async.forEachOfSeries(nodes, function(node, index, cb) {
			if (outerIndex===index) return cb()
			if (_.find(links, { source: outerIndex, target: index }) || _.find(links, { source: index, target: outerIndex })) {
				return cb()
			}
			var description = 'How well do ' + outerNode.name + ' and ' + node.name + ' know each other?'
			prompt.get({ name: 'value', description: description, pattern: /^[0-5]$/ }, function(err, data) {
				var value = data.value ? parseInt(data.value,10) : 0
				links.push({ source: outerIndex, target: index, value: value })
				writeLinks(links)
				cb()
			})	
		}, function(err) {
			outerCb()
		})
	}, function() {
		console.log('All people are linked')
		getNewPerson()
	});
}

getNewPerson()