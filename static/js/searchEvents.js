$('#searchButton').live('click', function(){
    searchEvent();
});

$('#searchEvent').live('keyup', function(event){
    if (event.keyCode==13){
        searchEvent();
    }

});

searchInDB = function(regex){
    var results;
    $.ajax({
        type : "GET",
        url : "/searchEvent",
        dataType : "json",
        data: {search: regex},
        async: false,
        success: function(resp){
            results=resp;
        }
    });
    return results;
};

searchEvent = function(){
    var regex='',
    splittedSearch = $('#searchEvent').val().split(' ');

    for (var i=0; i<splittedSearch.length; i++){
        regex = regex+'(?=.*'+splittedSearch[i]+')';
    }

    var results = searchInDB(regex);

    if (results==''){
        regex='';
        splittedSearch = $('#searchEvent').val().split(' ');

        for (var i=0; i<splittedSearch.length; i++){
            if (regex==''){
                regex = splittedSearch[i];
            }
            else{
                regex = regex+'|'+splittedSearch[i];
            }
        }

        results = searchInDB(regex);
    }

    console.log(results);

    var resultEvents = new Events(results);
    var resultEventsView = new EventsListView({
        collection : resultEvents,
        viewContainer : $('#searchResults'),
        part: 'all'
    });
    resultEventsView.render();
}