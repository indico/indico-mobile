$('#eventHome').live('pageinit', function(){

    myHistory = loadHistory();
    visited = false;
    var eventsView = new HistoryListView({
        collection: myHistory,
        viewContainer: eventsContainer = $('#eventList')
    });
    eventsView.render();

});