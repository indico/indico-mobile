
$('#eventHome').live('pagecreate', function(){
    visited=false;
    console.log('pagecreate')
    var futureEvents;
    $.ajax({
        type : "GET",
        url : "/futureEvents",
        dataType : "json",
        data: {
            part: 10
            },
        async: false,
        success: function(resp){
            futureEvents=resp;
        }
    });

    var futureEventsCollection = new Events(futureEvents.results);
    console.log(futureEventsCollection);

    if (futureEvents==''){
        futureEventsCollection = null;
    }

    var futureEventsView = new RecentEventsView({
        collection : futureEventsCollection,
        viewContainer : $('#futureEventList'),
        part: 10
    });
    futureEventsView.render();
});

$('#moreFutureEvents').live('click', function(){

    var recEvents
    $.ajax({
        type : "GET",
        url : "/futureEvent",
        dataType : "json",
        data: {part: parseInt($(this).attr('part'))},
        async: false,
        success: function(resp){
            recEvents=resp;
        }
    });

    if (recEvents!=''){
        var recentEvents = new Events(recEvents.results);
        var recentEventsView = new RecentEventsView({
            collection : recentEvents,
            viewContainer : $('#futureEventList'),
            part: parseInt($(this).attr('part'))
        });
        recentEventsView.render();
    }
});

$('#moreFutureEvents2').live('click', function(){

    var recEvents;
    $.ajax({
        type : "GET",
        url : "/futureEvent2",
        dataType : "json",
        data: {part: parseInt($(this).attr('part'))},
        async: false,
        success: function(resp){
            recEvents=resp;
        }
    });
    if (recEvents!=''){
        var recentEvents = new Events(recEvents.results);
        var recentEventsView = new RecentEventsView({
            collection : recentEvents,
            viewContainer : $('#futureEventList'),
            part: parseInt($(this).attr('part'))
        });
        recentEventsView.render();
    }
});

$('#morePastEvents2').live('click', function(){

    var recEvents;
    $.ajax({
        type : "GET",
        url : "/pastEvent2",
        dataType : "json",
        data: {part: parseInt($(this).attr('part'))},
        async: false,
        success: function(resp){
            recEvents=resp;
        }
    });
    if (recEvents!=''){
        var recentEvents = new Events(recEvents.results);
        var recentEventsView = new RecentEventsView({
            collection : recentEvents,
            viewContainer : $('#pastEventList'),
            part: parseInt($(this).attr('part'))
        });
        recentEventsView.render();
    }
});