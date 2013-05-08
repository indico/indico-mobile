$('#eventHome').live('pageinit', function(){
    var ongoingEventsView = new ListByMonthView({
        collection: new Events(),
        url: BASE_URL + 'services/ongoingEvents/',
        container: '#ongoingEventList',
        template_name: '#eventList',
        empty_message: 'No events found'
    });
    $("#more-events").click(function(){
        ongoingEventsView.nextItems();
    });



});