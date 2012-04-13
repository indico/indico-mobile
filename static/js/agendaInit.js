$('#agendaHome').live('pageinit', function(){
    myEvents = loadAgendaEvents();
    visited=false;

    var eventsView = new AgendaEventsListView({
        collection : myEvents,
        viewContainer : eventsContainer = $('#eventList')
    });
    eventsView.render();
});