$('#eventHome').live('pageinit', function(){

    var eventsView = new HistoryListView({
        collection: new Events(),
        url: BASE_URL + 'services/historyEvents/',
        favoritesUrl: BASE_URL + 'services/favorites/historyEvents/',
        container: '#eventList',
        template_name: '#eventList',
        empty_message: 'No history stored yet.'
    });

});