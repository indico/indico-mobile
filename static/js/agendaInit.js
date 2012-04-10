$(document).live('pageinit', function(){
    myEvents = loadAgenda();
    visited=false;
    inAgenda=null;
    if (myEvents==null){
        myEvents = new Days();
    }
    var eventsView = new EventsListView({
        collection : myEvents,
        viewContainer : eventsContainer = $('#eventList')
    });
    eventsView.render();
});