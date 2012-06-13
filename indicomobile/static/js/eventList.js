$('#eventHome').live('pagecreate', function(){

    visited = false;


    var futureEventsView = new EventsListView({
        collection: new Events(),
        url: '/futureEvents/',
        container: '#futureEventList'
    });
    var ongoingEventsView = new EventsListView({
        collection: new Events(),
        url: '/ongoingEvents/',
        container: '#ongoingEventList'
    }); 

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