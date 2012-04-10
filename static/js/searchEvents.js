$('#searchButton').live('click', function(){
    searchEvent();
});

$('#searchEvent').live('keyup', function(event){
    if (event.keyCode==13){
        searchEvent();
    }

});

searchEvent = function(){
    var regex='',
    splittedSearch = $('#searchEvent').val().split(' ');

    for (var i=0; i<splittedSearch.length; i++){
        regex = regex+'(?=.*'+splittedSearch[i]+')';
    }

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
    }

    var resultEvents = new Events(results);
    var resultEventsView = new EventsListView({
        collection : resultEvents,
        viewContainer : $('#searchResults'),
        part: 'all'
    });
    resultEventsView.render();
}