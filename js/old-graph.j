function createParty(data, params, start) {
    data.preservedLinks = data.links
    var start = start || _.last(params.partyStack)
    params.partyStack = params.partyStack || [start]
    var linked = _.where(data.links, { source: start }).concat(_.where(data.links, { target: start }))
    
    //for every linked person, give a score of links with existing party
    var scored = linked.map(function(link, index) {
        for (var i = 0; i < params.partyStack.length; i++) {
            if (params.partyStack[i]===link.source || params.partyStack[i]===link.target) {
                link.score = link.score ? link.score : 1
            }
        };
        return link
    })
    //console.log('scored list',scored)
    //if diversity = 1, reverse this list

    var pick = _.first(_.sortByOrder(linked, 'value', 'desc'))
    if ((params.partyStack.length > params.size) || !pick) {
        if (!pick) {
            console.log('ran out')
        } else {
            console.log('size reached',params.size)
        }
        var names = params.partyStack.map(function(index) {
            return data.nodes[index].name
        })
        return names
    }
    var used
    if (pick.target===start) {
        used = pick.source
    } else {
        used = pick.target
    }
    params.partyStack.push(used)
    data.links = _.filter(data.links, function(link) {
        var snippedStack = params.partyStack.slice(0,params.partyStack.length-1)
        var remove = !((snippedStack.indexOf(link.source)<0) && (snippedStack.indexOf(link.target)<0))
        return !remove
    })
    console.log('filtered',data.links.length)
    return createParty(data, params)
}

    var party = createParty({ links: links, nodes: nodeData },{ size: 10 },31)
    console.log(party)