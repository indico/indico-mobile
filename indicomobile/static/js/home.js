$('#home').live('pageinit', function(){
	var nextEventInFavoritesView = new NextEventView({
		model: new Backbone.Model(),
		url: BASE_URL + 'favorites/nextEvent/',
		container: '#nextEvent',
        template_name: '#nextEvent'
	});
});