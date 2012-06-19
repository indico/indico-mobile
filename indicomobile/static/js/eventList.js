$('#eventHome').live('pagecreate', function(){

    visited = false;


    var futureEventsView = new ListByMonthView({
        collection: new Events(),
        url: '/futureEvents/',
        container: '#futureEventList',
        template_file: 'events.html',
        template_name: '#eventList',
        empty_message: 'No future events found.'
    });
    var ongoingEventsView = new ListByMonthView({
        collection: new Events(),
        url: '/ongoingEvents/',
        container: '#ongoingEventList',
        template_file: 'events.html',
        template_name: '#eventList',
        empty_message: 'No ongoing events found.'
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