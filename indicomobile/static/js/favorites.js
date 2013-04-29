$('#eventHome').live('pageinit', function(){

    var eventsView = new ListByMonthView({
        collection : new Events(),
        url: BASE_URL + 'services/favorites/events/',
        template_name: '#eventList',
        template_name2: '#simpleEventList',
        container : '#favoritesEventList',
        empty_message: 'Nothing in your favorites.',
        favorites: true
    });

});