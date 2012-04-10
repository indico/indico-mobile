$(document).live('pageinit', function(){
    history = loadHistory();
    visited=false;
    inAgenda=loadAgenda;
    var eventsView = new HistoryListView({
        collection : history,
        viewContainer : eventsContainer = $('#eventList')
    });
    eventsView.render();
});