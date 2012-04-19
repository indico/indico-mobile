$('#searchButton').live('click', function(){

    searchEvent();

});

$('#searchEvent').live('keyup', function(event){

    if (event.keyCode == 13){
        searchEvent();
    }

});

function searchInDB(regex){

    var results;
    $.ajax({
        type: "GET",
        url: "/searchEvent",
        dataType: "json",
        data: {
            search: regex
        },
        async: false,
        success: function(resp){
            results = resp;
        }
    });
    return results;

};

function newSearchInDB(regex){

    var results;
    $.ajax({
        type: "GET",
        url: "/newSearchEvent/" + regex,
        dataType: "json",
        async: false,
        success: function(resp){
            results = resp;
        }
    });
    return results;

};

function searchEvent(){

    var regex = '',
    splittedSearch = $('#searchEvent').val().split(' ');

    for (var i = 0; i < splittedSearch.length; i++){
        regex = regex + '(?=.*' + splittedSearch[i] + ')';
    }

    var results = searchInDB(regex);

    if (results === ''){
        regex = '';
        splittedSearch = $('#searchEvent').val().split(' ');

        for (var j = 0; j < splittedSearch.length; j++){
            if (regex === ''){
                regex = splittedSearch[j];
            }
            else{
                regex = regex + '|' + splittedSearch[j];
            }
        }

        results = searchInDB(regex);
    }
    var resultEvents = new Events(results);
    var resultEventsView = new EventsListView({
        collection : resultEvents,
        viewContainer : $('#searchResults'),
        part: 'all'
    });
    resultEventsView.render();

};