function searchInDB(term){
    var resultEventsView = new ListByMonthView({
        collection: new Events(),
        url: '/searchEvent/?search='+term,
        container : '#searchResults',
        template_file: 'events.html',
        template_name: '#eventList',
        empty_message: 'Nothing found.'
    });

}

$('#searchEvent').live('keyup', function(event){

    visited = false;
    if (event.keyCode == 13){
        $('#searchResults').empty();
        $('#searchResults').append('<div class="loader"><h4>Searching, please wait...</h4><img src="static/style/images/ajax-loader2.gif"/></div>');
        searchInDB($(this).val());
    }

});
