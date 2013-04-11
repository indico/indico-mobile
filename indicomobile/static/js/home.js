$('#home').live('pageinit', function(){
	var nextEventInAgendaView = new NextEventView({
		model: new Backbone.Model(),
		url: BASE_URL + 'agenda/nextEvent/',
		container: '#nextEvent',
        template_name: '#nextEvent'
	});
});