$('#eventHome').live('pageinit', function(){

    var myEvents = myAgenda.getInstance().events;
    visited = false;

    var eventsView = new AgendaEventsListView({
        collection : myEvents,
        viewContainer : eventsContainer = $('#agendaEventList')
    });
    eventsView.render();

});