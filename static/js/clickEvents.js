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

$('#eventHome').live('pageshow', function(){

    if ($('.inDay').length > 15){
        $('.inDay').remove();
    }

});