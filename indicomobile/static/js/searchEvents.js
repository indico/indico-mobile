function searchInDB(term){
    var resultEventsView = new SearchResultsView({
        collection: new Events(),
        url: '/searchEvent/?search='+term,
        container : '#searchResults',
        template_file: 'events.html',
        template_name: '#eventList',
        empty_message: 'Nothing found.',
        term: term
    });

}

$('#searchEvent').live('keyup', function(event){

    visited = false;
    if (event.keyCode == 13){
        $('#searchResults').empty();
        if ($('#searchResults').data('view') !== undefined){
            $('#searchResults').data('view').remove();
            $('#searchResults').data('view').infiniScroll.disableFetch();
        }
        $('#searchResults').parent().find('.loader').show();
        $('#searchResults').parent().find('.emptyMessage').hide();
        searchInDB($(this).val());
    }

});
