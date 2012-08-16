$('#eventHome').live('pagecreate', function(){
    
    var futureEventsView = new ListByMonthView({
        collection: new Events(),
        url: '/futureEvents/',
        agendaUrl: '/agenda/futureEvents/',
        container: '#futureEventList',
        template_name: '#eventList',
        empty_message: 'No future events found.'
    });
    var ongoingEventsView = new ListByMonthView({
        collection: new Events(),
        url: '/ongoingEvents/',
        agendaUrl: '/agenda/ongoingEvents/',
        container: '#ongoingEventList',
        template_name: '#eventList',
        empty_message: 'No ongoing events found.'
    }); 

});