$(document).live('pageinit', function(){
    var conferencesContainer = $('#confList'),
    conferencesView;
    myConferences = loadAgendaFromServer();
    conferencesView = new ConferencesListView({
        collection : myConferences,
        viewContainer : conferencesContainer
    });
    conferencesView.render();
});