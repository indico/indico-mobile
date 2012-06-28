$('#eventHome').live('pagecreate', function(){

    visited = false;

    var ongoingContributionsView = new SimpleEventsAndContributions({
        collection: new Events(),
        url: '/ongoingContributions/',
        agendaUrl: '/agenda/ongoingContributions/user/'+getUserId()+'/',
        container: '#contribList',
        template_name: '#contribution',
        template_name2: '#eventList',
        empty_message: 'No contributions happening now.',
        sessionDay: false
    });

});