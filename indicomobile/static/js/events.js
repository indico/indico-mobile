$('#eventHome').live('pageinit', function(){

    var futureEventsView = new ListByMonthView({
        collection: new Events(),
        url: BASE_URL + 'services/futureEvents/',
        favoritesUrl: BASE_URL + 'services/favorites/futureEvents/',
        container: '#futureEventList',
        template_name: '#eventList',
        empty_message: 'No future events found',
        more_button: '#more-future-events'
    });
    var ongoingEventsView = new ListByMonthView({
        collection: new Events(),
        url: BASE_URL + 'services/ongoingEvents/',
        favoritesUrl: BASE_URL + 'services/favorites/ongoingEvents/',
        container: '#ongoingEventList',
        template_name: '#eventList',
        empty_message: 'No ongoing events found',
        more_button: '#more-ongoing-events'
    });

    $("#more-ongoing-events").click(function(){
        ongoingEventsView.nextItems();
    });
    $("#more-future-events").click(function(){
        futureEventsView.nextItems();
    });


});

$("[id*=event_]").live('pageinit', function() {
    $("#favorite-toggle").click(function(e) {
        addRemoveEventAction($(e.currentTarget), null);
    });
});