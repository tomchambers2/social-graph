d3.json('../data/parsed/calls.json', function(data) {
    data = MG.convert.date(data, 'date');
    MG.data_graphic({
        title: "Calls per day",
        data: data,
        interpolate: 'basic',
        missing_is_zero: true,
        width: 600,
        height: 200,
        right: 40,
        min_x: new Date('2015-03-25'),
        max_x: new Date('2015-10-15'),
        target: '#calls'
    });
});