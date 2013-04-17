$('#eventHome').live('pageinit', function(){

    $("a#favorites").addClass("ui-btn-active ui-state-persist")

    var eventsView = new ListByMonthView({
        collection : new Events(),
        url: BASE_URL + 'favorites/events/',
        template_name: '#eventList',
        template_name2: '#simpleEventList',
        container : '#favoritesEventList',
        empty_message: 'Nothing in your favorites.',
        favorites: true
    });

});