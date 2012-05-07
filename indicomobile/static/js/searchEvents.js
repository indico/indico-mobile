function searchInDB(term){

    var results;
    $.ajax({
        type: "GET",
        url: "/searchEvent",
        dataType: "json",
        data: {
            search: term
        },
        async: true,
        success: function(resp){
            results = resp;
            $('#searchResults').data('resultEvents', new Events(results));
            $('#searchResults').data('part', 0);
            $('#loadingEvents').show();
            var resultEventsView = new EventsListView({
                collection : $('#searchResults').data('resultEvents'),
                viewContainer : $('#searchResults'),
                part: $('#searchResults').data('part')
            });
            resultEventsView.render();

            $.mobile.hidePageLoadingMsg();

            $(window).scroll(function() {
                if($(window).scrollTop() + $(window).height() > $('#searchResults').height()-150 &&
                        $('#searchResults').data('part') != -1) {
                    resultEventsView.options.create = false;
                    resultEventsView.render();
                }
            });
        }
    });

}

$('#searchEvent').live('keyup', function(event){

    visited = false;
    if (event.keyCode == 13){
        $.mobile.loadingMessageTextVisible = true;
        $.mobile.loadingMessage = "Searching... Please wait.";
        $.mobile.showPageLoadingMsg();
        searchInDB($(this).val());
    }

});
