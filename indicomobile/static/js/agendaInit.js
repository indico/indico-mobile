$('#eventHome').live('pageinit', function(){

    var myEvents = loadAgendaEvents();
    visited = false;

    var eventsView = new AgendaEventsListView({
        collection : myEvents,
        viewContainer : eventsContainer = $('#agendaEventList')
    });
    eventsView.render();

});