$('a[id="dayButton"]').live('click', function(event) {

    var date = $(this).html();
    if ($('#sessionInDay-'+date).html()==''){
    var slotsView = new SlotsView({
        collection : currentEvent,
        date : date
    });
    slotsView.render();
    }

    $.mobile.changePage($(this).attr('href'), {
        transition : 'fade',
        reverse : true
    });
        var daysListView = new DaysListView({
            collection : currentEvent,
            viewContainer : $('#listInDay-' + date),
            date : date
        });
        daysListView.render();

});

$('#eventLinkFromAgenda').live('click', function(event) {

    var currentContrib = $(this).attr('eventId');
    currentEvent = myEvents.find(function(event){
        return event.get('id')==currentContrib;
    });
    var history;
    if(!localStorage.getItem('history')){
        history = new Events();
        var toAdd = currentEvent.clone().set('days','');
        toAdd.set('viewedAt',new Date().getTime());
        history.add(toAdd);
        localStorage.setItem('history', JSON.stringify(history.toJSON()));
    }else{
        history = loadHistory();
        var isInHistory = history.find(function(event){
            return event.get('id')==currentEvent.get('id');
        });
        if (!isInHistory){

            if (history.size()<10){
                var toAdd = currentEvent.clone().set('days','');
                toAdd.set('viewedAt',new Date().getTime());
                history.add(toAdd);
            }else{
                var toAdd = currentEvent.clone().set('days','');
                toAdd.set('viewedAt',new Date().getTime());
                history.add(toAdd);
                history.remove(history.at(0));
            }
            localStorage.setItem('history', JSON.stringify(history.toJSON()));
        }
        else{
            history.remove(isInHistory);
            if (history.size()<10){
                var toAdd = currentEvent.clone().set('days','');
                toAdd.set('viewedAt',new Date().getTime());
                history.add(toAdd);
            }else{
                var toAdd = currentEvent.clone().set('days','');
                toAdd.set('viewedAt',new Date().getTime());
                history.add(toAdd);
                history.remove(history.at(0));
            }
            localStorage.setItem('history', JSON.stringify(history.toJSON()));
        }
    }
    allDays = currentEvent.get('days')
    inAgenda = null;

    var daysListView = new DaysListView({
        collection : currentEvent,
        viewContainer : $('#list'),
        date : ''
    });
    daysListView.render();

    var daysDetailView = new DaysDetailView({
        collection : currentEvent
    });
    daysDetailView.render();
});

$('#alldays').live('pageshow', function(event,ui){
    visited = true;
});

$('#eventLinkFromEvents').live('click', function(event) {
    currentEvent = initEvent($(this).attr('eventId'));
    var history;
    if(!localStorage.getItem('history')){
        history = new Events();
        var toAdd = currentEvent.clone().set('days','');
        toAdd.set('viewedAt',new Date().getTime());
        history.add(toAdd);
        localStorage.setItem('history', JSON.stringify(history.toJSON()));
    }else{
        history = loadHistory();
        var isInHistory = history.find(function(event){
            return event.get('id')==currentEvent.get('id');
        });
        if (!isInHistory){

            if (history.size()<10){
                var toAdd = currentEvent.clone().set('days','');
                toAdd.set('viewedAt',new Date().getTime());
                history.add(toAdd);
            }else{
                var toAdd = currentEvent.clone().set('days','');
                toAdd.set('viewedAt',new Date().getTime());
                history.add(toAdd);
                history.remove(history.at(0));
            }
            localStorage.setItem('history', JSON.stringify(history.toJSON()));
        }
        else{
            history.remove(isInHistory);
            if (history.size()<10){
                var toAdd = currentEvent.clone().set('days','');
                toAdd.set('viewedAt',new Date().getTime());
                history.add(toAdd);
            }else{
                var toAdd = currentEvent.clone().set('days','');
                toAdd.set('viewedAt',new Date().getTime());
                history.add(toAdd);
                history.remove(history.at(0));
            }
            localStorage.setItem('history', JSON.stringify(history.toJSON()));
        }
    }
    allDays = currentEvent.get('days')
    inAgenda = loadAgenda();

    var daysListView = new DaysListView({
        collection : currentEvent,
        viewContainer : $('#list'),
        date : ''
    });
    daysListView.render();

    var daysDetailView = new DaysDetailView({
        collection : currentEvent
    });
    daysDetailView.render();

});


$('a[id="more"]').live('click', function(event) {

    $(this).hide();

    var contributionsView = new ContributionView({
        collection : currentEvent,
        date : $(this).attr('day'),
        session : $(this).attr('sessionId'),
        part : $(this).attr('value')
    });
    contributionsView.render();

});

$('#searchHome').live('pageshow', function(){
    $('.inDay').remove();
});

$('#futureEventHome').live('pageshow', function(){
    $('.inDay').remove();
});

$('#agendaHome').live('pageshow', function(){
    $('.inDay').remove();
});

$('#historyHome').live('pageshow', function(){
    $('.inDay').remove();
});

$('#addEvent').live('keyup', function(event){
    if (event.keyCode==13){
        currentEvent = initEvent($(this).val());
    }

});



$('div[info="sessionCol"]').live('click', function() {



        var contributionsView = new ContributionView({
            collection : currentEvent,
            date : $(this).attr('day'),
            session : $(this).attr('sessionId'),
            part : 0
        });
        contributionsView.render();
});