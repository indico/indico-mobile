getDays = function(eventId){
    var days;
    $.ajax({
        type : "GET",
        url : "/eventDays",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId,
        },
        success: function(resp){
            days=resp;
        }
    });
    console.log(days)
    return new Days(days);

}

getDaySessions = function(eventId, day){
    var sessions;
    $.ajax({
        type : "GET",
        url : "/daySessions",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId,
            day: day
        },
        success: function(resp){
            sessions=resp;
        }
    });
    return new Slots(sessions);
}

getSessionContributions = function(eventId, day, sessionId){
    var contributions;
    $.ajax({
        type : "GET",
        url : "/sessionContributions",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId,
            day: day,
            sessionId: sessionId
        },
        success: function(resp){
            contributions=resp;
        }
    });
    return new Contributions(contributions);

}

getEventContributions = function(eventId){
    var contributions;
    $.ajax({
        type : "GET",
        url : "/eventContributions",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId
        },
        success: function(resp){
            contributions=resp;
        }
    });
    return new Contributions(contributions);

}

getEventSessions = function(eventId){
    var sessions;
    $.ajax({
        type : "GET",
        url : "/eventSessions",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId
        },
        success: function(resp){
            sessions=resp;
        }
    });
    return new Slots(sessions);

}

$('a[id="dayButton"]').live('click', function(event) {

    var eventId = $(this).attr('eventId');
    var daysCollection = getDays(eventId);

    var date = $(this).html();
    var sessionsCollection = getDaySessions(eventId, date);
    if ($('#sessionInDay-'+eventId+'-'+date).html()==''){
    var slotsView = new SlotsView({
        collection : sessionsCollection,
        date : date,
        eventId: eventId
    });
    slotsView.render();
    }

    $.mobile.changePage($(this).attr('href'), {
        transition : 'fade',
        reverse : true
    });
    var daysListView = new DaysListView({
        collection : daysCollection,
        viewContainer : $('#listInDay-'+eventId+'-' + date),
        date : date
    });
    daysListView.render();

});

$('a[id="agendaDayButton"]').live('click', function(event) {

    var eventId = $(this).attr('eventId');
    var days = loadAgendaDays();
    var daysCollection = new Days(days.filter(function(day){
        return day.get('eventId')==eventId;
    }));

    var date = $(this).html();


    var sessions = loadAgendaSessions();
    var sessionsCollection = new Slots(sessions.filter(function(session){
        return session.get('eventId')==eventId && session.get('dayDate')==date;
    }));

    if ($('#sessionInDay-'+eventId+'-'+date).html()==''){
    var slotsView = new AgendaSlotsView({
        collection : sessionsCollection,
        date : date,
        eventId: eventId
    });
    slotsView.render();
    }

    $.mobile.changePage($(this).attr('href'), {
        transition : 'fade',
        reverse : true
    });
        var daysListView = new AgendaDaysListView({
            collection : daysCollection,
            viewContainer : $('#listInDay-'+eventId+'-' + date),
            date : date
        });
        daysListView.render();

});

$('#eventLinkFromAgenda').live('click', function(event) {

    var eventId = $(this).attr('eventId');
    var eventInfo = getEvent(eventId);
    $('#headerTitle').html(eventInfo.get('title'));
    var days = loadAgendaDays();
    var daysCollection = new Days(days.filter(function(day){
        return day.get('eventId')==eventId;
    }));

    var daysListView = new AgendaDaysListView({
        collection : daysCollection,
        viewContainer : $('#list'),
        date : ''
    });
    daysListView.render();

    var daysDetailView = new AgendaDaysDetailView({
        collection : daysCollection
    });
    daysDetailView.render();
});

$('#alldays').live('pageshow', function(event,ui){
    visited = true;
});

$('#eventLinkFromEvents').live('click', function(event) {

    var eventId = $(this).attr('eventId');
    var eventInfo = getEvent(eventId);
    $('#headerTitle').html($(this).html());

    addToHistory(eventId);

    var daysCollection = getDays(eventId);
    console.log(daysCollection)

    var daysListView = new DaysListView({
        collection : daysCollection,
        viewContainer : $('#list'),
        date : ''
    });
    daysListView.render();

    var daysDetailView = new DaysDetailView({
        collection : daysCollection
    });
    daysDetailView.render();

});

addToHistory = function(eventId){
  myHistory = loadHistory();
  var now = new Date();
  var eventInHistory = myHistory.find(function(event){
      return event.get('id')==eventId;
  });
  if (eventInHistory){
      eventInHistory.set('viewedAt', now.getTime());
  }
  else{
      event = getEvent(eventId);
      event.set('viewedAt', now.getTime());
      if (myHistory.size()>=10){
          myHistory.remove(myHistory.at(0));
          myHistory.add(event);
      }
      else{
          myHistory.add(event);
      }
  }
  localStorage.setItem('history', JSON.stringify(myHistory.toJSON()));
};


$('a[id="more"]').live('click', function(event) {

    var eventId = $(this).attr('eventId');
    var sessionId = $(this).attr('sessionId');
    var day = $(this).attr('day');
    var part = $(this).attr('value');
    var contributionsCollection = getSessionContributions(eventId,day, sessionId);

    $(this).hide();

    var contributionsView = new ContributionView({
        collection : contributionsCollection,
        date : day,
        event : eventId,
        session : sessionId,
        part : part
    });
    contributionsView.render();

});

$('a[id="agendaMore"]').live('click', function(event) {

    var eventId = $(this).attr('eventId');
    var sessionId = $(this).attr('sessionId');
    var day = $(this).attr('day');
    var part = $(this).attr('value');

    var contributions = loadAgendaContributions();
    var contributionsCollection = new Contributions(contributions.filter(function(contrib){
        return contrib.get('eventId')==eventId && contrib.get('dayDate')==day && contrib.get('sessionId')==sessionId;
    }));

    $(this).hide();

    var contributionsView = new AgendaContributionView({
        collection : contributionsCollection,
        date : day,
        event : eventId,
        session : sessionId,
        part : part
    });
    contributionsView.render();

});

$('#eventHome').live('pageshow', function(){
    if ($('.inDay').length>15){
        $('.inDay').remove();
    }
});

$('#agendaHome').live('pageshow', function(){
    if ($('.inDay').length>15){
        $('.inDay').remove();
    }
});

$('#historyHome').live('pageshow', function(){
    if ($('.inDay').length>15){
        $('.inDay').remove();
    }
});

$('#addEvent').live('keyup', function(event){
    if (event.keyCode==13){
        getDays($(this).val());
    }

});



$('div[info="sessionCollapsible"]').live('click', function() {

    var eventId = $(this).attr('eventId');
    var sessionId = $(this).attr('sessionId')
    var day = $(this).attr('day')
    var contributionsCollection = getSessionContributions(eventId,day, sessionId);

    if (contributionsCollection.size()>0){
        var contributionsView = new ContributionView({
            collection : contributionsCollection,
            date : day,
            session : sessionId,
            event : eventId,
            part : 0
        });
        contributionsView.render();
    }
});

$('div[info="agendaSessionCollapsible"]').live('click', function() {

    var eventId = $(this).attr('eventId');
    var sessionId = $(this).attr('sessionId');
    var day = $(this).attr('day');

    var contributions = loadAgendaContributions();
    var contributionsCollection = new Contributions(contributions.filter(function(contrib){
        return contrib.get('eventId')==eventId && contrib.get('dayDate')==day && contrib.get('sessionId')==sessionId;
    }));

    console.log(contributionsCollection);

    if (contributionsCollection.size()>0){
        var contributionsView = new AgendaContributionView({
            collection : contributionsCollection,
            date : day,
            session : sessionId,
            event : eventId,
            part : 0
        });
        contributionsView.render();
    }
});