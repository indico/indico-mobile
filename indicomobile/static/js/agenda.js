$('#eventHome').live('pageinit', function(){

    $("a#agenda").addClass("ui-btn-active ui-state-persist")

    var eventsView = new ListByMonthView({
        collection : new Events(),
        url: BASE_URL + 'agenda/events/',
        template_name: '#eventList',
        template_name2: '#simpleEventList',
        container : '#agendaEventList',
        empty_message: 'Nothing in your agenda.',
        agenda: true
    });

});