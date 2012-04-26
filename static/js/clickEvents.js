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

}


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