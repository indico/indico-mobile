$('#eventHome').live('pagecreate', function(){

    visited = false;


    var futureEventsView = new ListByMonthView({
        collection: new Events(),
        url: '/futureEvents/',
        agendaUrl: '/agenda/futureEvents/user/'+getUserId()+'/',
        container: '#futureEventList',
        template_name: '#eventList',
        template_name2: '#simpleEventList',
        empty_message: 'No future events found.'
    });
    var ongoingEventsView = new ListByMonthView({
        collection: new Events(),
        url: '/ongoingEvents/',
        agendaUrl: '/agenda/ongoingEvents/user/'+getUserId()+'/',
        container: '#ongoingEventList',
        template_name: '#eventList',
        template_name2: '#simpleEventList',
        empty_message: 'No ongoing events found.'
    }); 

});