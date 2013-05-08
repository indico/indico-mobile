$('#eventHome').live('pageinit', function(){

    var eventsView = new ListView({
        collection : new Events(),
        url: BASE_URL + 'services/favorites/events/',
        template_name: '#eventListInFavorites',
        container : '#favoritesEventList',
        empty_message: 'Nothing in your favorites',
        favorites: true
    });

});