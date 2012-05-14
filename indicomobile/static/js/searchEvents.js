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
                viewContainer : $('#searchResults'),
                part: $('#searchResults').data('part')
            });
            resultEventsView.render();
            if (typeof term !== 'undefined' && term != '' && term != ' '){
                for (word in term.split(' ')){
                    $('#searchResults').find('li[data-role!="list-divider"]').highlight(term.split(' ')[word]);
                }
            }
            $('#searchResults').data('view', resultEventsView);

            $.mobile.hidePageLoadingMsg();

            $(window).on('scroll', function() {
                if($(window).scrollTop() + $(window).height() > $('#eventHome').height()-150 &&
                        $('#searchResults').data('part') != -1) {
                    resultEventsView.options.create = false;
                    resultEventsView.render();
                    if (typeof term !== 'undefined' && term != '' && term != ' '){
                        for (word in term.split(' ')){
                            $('#searchResults').find('li').highlight(term.split(' ')[word]);
                        }
                    }
                }
            });
        }
    });

}

$('#eventHome').live('pageshow', function(){
    var container = $('#searchResults');
    $(window).on('scroll', function() {
        if (container.html() != ''){
            if(container.data('part') != -1 &&
                    $(window).scrollTop() + $(window).height() >= $('#eventHome').height()-150) {
                container.data('view').options.create = false;
                container.data('view').render();
                var term = $('#searchEvent').val();
                if (typeof term !== 'undefined' && term != '' && term != ' '){
                    for (word in term.split(' ')){
                        container.find('li[data-role!="list-divider"]').highlight(term.split(' ')[word]);
                    }
                }
            }
        }
    });
});

$('#searchEvent').live('keyup', function(event){

    visited = false;
    if (event.keyCode == 13){
        $.mobile.loadingMessageTextVisible = true;
        $.mobile.loadingMessage = "Searching... Please wait.";
        $.mobile.showPageLoadingMsg();
        searchInDB($(this).val());
    }

});
