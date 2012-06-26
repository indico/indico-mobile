$('#eventHome').live('pageinit', function(){

    var eventsView = new HistoryListView({
        collection: new Events(),
        container: '#eventList',
        template_name: '#eventList',
        empty_message: 'No history stored yet.'
    });

});