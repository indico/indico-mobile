$('#home').live('pageinit', function(){
	var nextEventInAgendaView = new NextEventView({
		model: new Backbone.Model(),
		url: '/agenda/nextEvent/',
		container: '#nextEvent',
        template_name: '#nextEvent'
	});
});