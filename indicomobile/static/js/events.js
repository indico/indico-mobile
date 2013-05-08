$('#eventHome').live('pageinit', function(){
    var ongoingEventsView = new ListByMonthView({
        collection: new Events(),
        url: BASE_URL + 'services/ongoingEvents/',
        favoritesUrl: BASE_URL + 'services/favorites/ongoingEvents/',
        container: '#ongoingEventList',
        template_name: '#eventList',
        empty_message: 'No events found',
        more_button:"#more-events"
    });
    $("#more-events").click(function(){
        ongoingEventsView.nextItems();
    });



});