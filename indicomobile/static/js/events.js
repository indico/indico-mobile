$('#eventHome').live('pagecreate', function(){

    $("a#events").addClass("ui-btn-active ui-state-persist")

    var futureEventsView = new ListByMonthView({
        collection: new Events(),
        url: BASE_URL + 'futureEvents/',
        agendaUrl: BASE_URL + 'agenda/futureEvents/',
        container: '#futureEventList',
        template_name: '#eventList',
        empty_message: 'No future events found.'
    });
    var ongoingEventsView = new ListByMonthView({
        collection: new Events(),
        url: BASE_URL + 'ongoingEvents/',
        agendaUrl: BASE_URL + 'agenda/ongoingEvents/',
        container: '#ongoingEventList',
        template_name: '#eventList',
        empty_message: 'No ongoing events found.'
    });

});