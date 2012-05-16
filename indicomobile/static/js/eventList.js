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
        part: 0
    });
    futureEventsView.render();
    $('#futureEventList').data('view', futureEventsView);

    var ongoingEvents = getOngoingEvents(0);

    var ongoingEventsCollection = new Events(ongoingEvents);

    if (ongoingEvents === ''){
        ongoingEventsCollection = null;
    }

    var ongoingEventsView = new RecentEventsView({
        collection: ongoingEventsCollection,
        viewContainer: $('#ongoingEventList'),
        part: 0
    });
    ongoingEventsView.render();
    $('#ongoingEventList').data('view', ongoingEventsView);

});

//$('#moreFutureEvents').live('click', function(){
//
//    var part = parseInt($(this).attr('part'), 10);
//    var recEvents = getFutureEvents(part);
//    $(this).hide();
//
//    if (recEvents !== ''){
//        var recentEvents = new Events(recEvents);
//        $('#futureEventList').data('view').options.part = part;
//        $('#futureEventList').data('view').collection = recentEvents;
//        $('#futureEventList').data('view').render();
//    }
//
//});
//
//$('#moreOngoingEvents').live('click', function(){
//
//    var part = parseInt($(this).attr('part'), 10);
//    var recEvents = getOngoingEvents(part);
//    $(this).hide();
//
//    if (recEvents !== ''){
//        var recentEvents = new Events(recEvents);
//        $('#ongoingEventList').data('view').options.part = part;
//        $('#ongoingEventList').data('view').collection = recentEvents;
//        $('#ongoingEventList').data('view').render();
//    }
//
//});