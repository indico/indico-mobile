$('a[id="dayButton"]').live('click', function(event) {

    var eventId = $(this).attr('eventId');
    var daysCollection = getDays(eventId);

    var date = $(this).html();
    var sessionsCollection = getDaySessions(eventId, date);
    if ($('#sessionInDay-' + eventId + '-' + date).html() === ''){
    var slotsView = new SlotsView({
        collection: sessionsCollection,
        date: date,
        eventId: eventId
    });
    slotsView.render();
    }

    $.mobile.changePage($(this).attr('href'), {
        transition: 'fade',
        reverse: true
    });
    var daysListView = new DaysListView({
        collection: daysCollection,
        viewContainer: $('#listInDay-' + eventId + '-' + date),
        date: date
    });
    daysListView.render();

});

$('a[id="agendaDayButton"]').live('click', function(event) {

    var eventId = $(this).attr('eventId');
    var days = loadAgendaDays();
    var daysCollection = new Days(days.filter(function(day){
        return day.get('eventId') == eventId;
    }));

    var date = $(this).html();


    var sessions = loadAgendaSessions();
    var sessionsCollection = new Slots(sessions.filter(function(session){
        return session.get('eventId') == eventId && session.get('dayDate') == date;
    }));

    if ($('#sessionInDay-'+eventId+'-'+date).html() === ''){
    var slotsView = new AgendaSlotsView({
        collection: sessionsCollection,
        date: date,
        eventId: eventId
    });
    slotsView.render();
    }

    $.mobile.changePage($(this).attr('href'), {
        transition: 'fade',
        reverse : true
    });
    var daysListView = new AgendaDaysListView({
        collection: daysCollection,
        viewContainer: $('#listInDay-' + eventId + '-' + date),
        date: date
    });
    daysListView.render();

});

$('#eventLinkFromAgenda').live('click', function(event) {

    var eventId = $(this).attr('eventId');
    var eventInfo = getEvent(eventId);
    $('#headerTitle').html(eventInfo.get('title'));
    var days = loadAgendaDays();
    var daysCollection = new Days(days.filter(function(day){
        return day.get('eventId') == eventId;
    }));

    var daysListView = new AgendaDaysListView({
        collection: daysCollection,
        viewContainer: $('#list'),
        date: ''
    });
    daysListView.render();

    var daysDetailView = new AgendaDaysDetailView({
        collection: daysCollection
    });
    daysDetailView.render();

});

$('#alldays').live('pageshow', function(event,ui){

    visited = true;

});

function addToHistory(eventId){

  var myHistory = loadHistory();
  myHistory.comparator = function(event){
      return parseInt(event.get('viewedAt'), 10);
  };
  myHistory.sort();

  var now = new Date();
  var event = new Event({'id': eventId, 'viewedAt': now.getTime()});

  var eventInHistory = myHistory.find(function(currentEvent){
      return currentEvent.get('id') == eventId;
  });
  if (eventInHistory){
      myHistory.remove(eventInHistory);
      eventInHistory.set('viewedAt', now.getTime());
      myHistory.add(eventInHistory);
  }
  else{
      if (myHistory.size() >= 10){
          myHistory.remove(myHistory.at(0));
          myHistory.add(event);
      }
      else{
          myHistory.add(event);
      }
  }
  localStorage.setItem('myHistory', JSON.stringify(myHistory.toJSON()));

};

$('#eventLinkFromEvents').live('click', function(event) {

    var eventId = $(this).attr('eventId');
    var eventInfo = getEvent(eventId);
    $('#headerTitle').html($(this).html());

    addToHistory(eventId);

    var daysCollection = getDays(eventId);

    var daysListView = new DaysListView({
        collection: daysCollection,
        viewContainer: $('#list'),
        date: ''
    });
    daysListView.render();

    var daysDetailView = new DaysDetailView({
        collection: daysCollection
    });
    daysDetailView.render();

});


$('a[id="more"]').live('click', function(event) {

    var eventId = $(this).attr('eventId');
    var sessionId = $(this).attr('sessionId');
    var day = $(this).attr('day');
    var part = $(this).attr('value');
    var contributionsCollection = getSessionContributions(eventId, day, sessionId);

    $(this).hide();

    var contributionsView = new ContributionView({
        collection: contributionsCollection,
        date: day,
        event: eventId,
        session: sessionId,
        part: part
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
        return contrib.get('eventId') == eventId &&
        contrib.get('dayDate') == day &&
        contrib.get('sessionId') == sessionId;
    }));

    $(this).hide();

    var contributionsView = new AgendaContributionView({
        collection: contributionsCollection,
        date: day,
        event: eventId,
        session: sessionId,
        part: part
    });
    contributionsView.render();

});

$('#eventHome').live('pageshow', function(){

    if ($('.inDay').length > 15){
        $('.inDay').remove();
    }

});

$('#agendaHome').live('pageshow', function(){

    if ($('.inDay').length > 15){
        $('.inDay').remove();
    }

});

$('#historyHome').live('pageshow', function(){

    if ($('.inDay').length > 15){
        $('.inDay').remove();
    }

});

$('#addEvent').live('keyup', function(event){

    if (event.keyCode == 13){
        getDays($(this).val());
    }

});



$('div[info="sessionCollapsible"]').live('click', function() {

    var eventId = $(this).attr('eventId');
    var sessionId = $(this).attr('sessionId');
    var day = $(this).attr('day');
    var contributionsCollection = getSessionContributions(eventId,day, sessionId);

    if (contributionsCollection.size() > 0){
        var contributionsView = new ContributionView({
            collection: contributionsCollection,
            date: day,
            session: sessionId,
            event: eventId,
            part: 0
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
        return contrib.get('eventId') == eventId &&
        contrib.get('dayDate') == day &&
        contrib.get('sessionId') == sessionId;
    }));

    if (contributionsCollection.size() > 0){
        var contributionsView = new AgendaContributionView({
            collection: contributionsCollection,
            date: day,
            session: sessionId,
            event: eventId,
            part: 0
        });
        contributionsView.render();
    }

});