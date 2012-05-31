$('#home').live('pageinit', function(){
	var contribs = loadAgendaContributions();
	var simpleEvents = loadAgendaEvents().filter(function(event){
		return event.get('type') == 'simple_event';
	});
	for (var i = 0; i < simpleEvents.length; i++){
		contribs.add(simpleEvents[i]);
	}
	console.log(contribs);

	var now = new Date();

	var nextContribs = new Contributions();

	contribs.each(function(contrib){
		var splittedDate = contrib.get('startDate').date.split('-');
		var splittedTime = contrib.get('startDate').time.split(':');
		var date = new Date(splittedDate[0],splittedDate[1]-1,splittedDate[2],
							splittedTime[0],splittedTime[1],splittedTime[2]);
		if(date > now){
			nextContribs.add(contrib);
		}

	});

	nextContribs.comparator = function(contrib){
		var splittedDate = contrib.get('startDate').date.split('-');
		var splittedTime = contrib.get('startDate').time.split(':');
		var date = new Date(splittedDate[0],splittedDate[1]-1,splittedDate[2],
							splittedTime[0],splittedTime[1],splittedTime[2]);
        return date;
    };
    nextContribs.sort();
    if(nextContribs.size() > 0){
	    var nextEventView = new NextEventView({
	    	container: $('#nextEvent'),
	    	contrib: nextContribs.at(0)
	    });
	    nextEventView.render();
	}
});