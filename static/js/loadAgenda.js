loadAgenda = function(){
	if(localStorage.getItem('agenda')) {
		var myAgenda = new Days(JSON.parse(localStorage.getItem('agenda')));
		myAgenda.each(function(conference){
		    conference.set('days', new Days(conference.get('days')));
	        conference.get('days').each(function(day) {
	            day.set('slots', new Slots(day.get('slots')));
	            day.get('slots').each(function(slot) {
	                var tempContribs = new Contributions();
	                slot.set('contributions', new Contributions(slot.get('contributions')));
	            });
	        });
		});
}
return myAgenda;
}

loadAgendaFromServer = function(){
	var agenda;
	$.ajax({
			type : "GET",
			url : "/load",
			dataType : "json",
			async: false,
			data : {
				name:'claude'
			},
			success: function(resp){
				console.log(resp)
				agenda=resp['agenda'];
			}
	});
	console.log(agenda)
	if(agenda) {
		var myAgenda = new Days(agenda);
		myAgenda.each(function(conference){
            conference.set('days', new Days(conference.get('days')));
            conference.get('days').each(function(day) {
                day.set('slots', new Slots(day.get('slots')));
                day.get('slots').each(function(slot) {
                    var tempContribs = new Contributions();
                    slot.set('contributions', new Contributions(slot.get('contributions')));
                });
            });
        });
		console.log(myAgenda);
}
return myAgenda;
}
