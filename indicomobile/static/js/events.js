$('#eventHome').live('pageinit', function(){

    $("a#events").addClass("ui-btn-active ui-state-persist")

    var futureEventsView = new ListByMonthView({
        collection: new Events(),
        url: BASE_URL + 'services/futureEvents/',
        favoritesUrl: BASE_URL + 'services/favorites/futureEvents/',
        container: '#futureEventList',
        template_name: '#eventList',
        empty_message: 'No future events found.'
    });
    var ongoingEventsView = new ListByMonthView({
        collection: new Events(),
        url: BASE_URL + 'services/ongoingEvents/',
        favoritesUrl: BASE_URL + 'services/favorites/ongoingEvents/',
        container: '#ongoingEventList',
        template_name: '#eventList',
        empty_message: 'No ongoing events found.'
    });

});