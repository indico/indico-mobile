function searchInDB(term){
    var resultEventsView = new SearchResultsView({
        collection: new Events(),
        url: '/searchEvent/'+term+'/',
        agendaUrl: '/agenda/searchEvent/'+term+'/user/'+getUserId()+'/',
        container : '#searchResults',
        template_name: '#eventList',
        template_name2: '#simpleEventList',
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
