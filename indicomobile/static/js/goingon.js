$('#eventHome').live('pagecreate', function(){

    $("a#ongoing").addClass("ui-btn-active ui-state-persist")

    visited = false;

    var ongoingContributionsView = new SimpleEventsAndContributions({
        collection: new Events(),
        url: BASE_URL + 'ongoingContributions/',
        agendaUrl: BASE_URL + 'agenda/ongoingContributions/',
        container: '#contribList',
        template_name: '#contributionHappening',
        template_name2: '#eventList',
        empty_message: 'No contributions happening now.',
        sessionDay: false
    });

});