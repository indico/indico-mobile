$('#searchEvent').live('keyup', function(event){

    visited = false;
    if (event.keyCode == 13){
        $.mobile.loadingMessageTextVisible = true;
        $.mobile.loadingMessage = "Searching... Please wait.";
        $.mobile.showPageLoadingMsg();
        searchInDB($(this).val());
    }

});

$('#moreResults').live('click', function(event){

    var part = $(this).attr('part');
    var resultEventsView = new EventsListView({
        collection : resultEvents,
        viewContainer : $('#searchResults'),
        part: part
    });
    resultEventsView.render();

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
        async: true,
        success: function(resp){
            results = resp;
            resultEvents = new Events(results);
            var resultEventsView = new EventsListView({
                collection : resultEvents,
                viewContainer : $('#searchResults'),
                part: 0
            });
            resultEventsView.render();

            $.mobile.hidePageLoadingMsg();
        }
    });

};
