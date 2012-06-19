$('#eventHome').live('pageinit', function(){

    myHistory = loadHistory();
    visited = false;
    var eventsView = new ListView({
        collection: myHistory,
        container: '#eventList',
        template_file: 'events.html',
        template_name: '#eventList',
        empty_message: 'No history stored yet.'
    });

});