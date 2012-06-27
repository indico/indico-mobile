$('#eventHome').live('pageinit', function(){

    var eventsView = new ListByMonthView({
        collection : new Events(),
        url: '/agenda/events/user/'+getUserId()+'/',
        template_name: '#eventList',
        template_name2: '#simpleEventList',
        container : '#agendaEventList',
        empty_message: 'Nothing in your agenda.',
        agenda: true
    });

});