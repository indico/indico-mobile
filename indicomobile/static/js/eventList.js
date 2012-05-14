$('#eventHome').live('pagecreate', function(){

    visited = false;
    var futureEvents = getFutureEvents(0);

    var futureEventsCollection = new Events(futureEvents);

    if (futureEvents === ''){
        futureEventsCollection = null;
    }

    var futureEventsView = new RecentEventsView({
        collection: futureEventsCollection,
        viewContainer: $('#futureEventList'),
        part: 10
    });
    futureEventsView.render();

});

$('#moreFutureEvents').live('click', function(){

    var part = parseInt($(this).attr('part'), 10);
    var recEvents = getFutureEvents(part);

    if (recEvents !== ''){
        var recentEvents = new Events(recEvents);
        var recentEventsView = new RecentEventsView({
            collection: recentEvents,
            viewContainer: $('#futureEventList'),
            part: part
        });
        recentEventsView.render();
    }

});