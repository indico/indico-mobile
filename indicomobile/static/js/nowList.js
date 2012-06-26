$('#eventHome').live('pagecreate', function(){

    visited = false;

    var ongoingContributionsView = new SpeakerContribsListView({
        collection: new Events(),
        url: '/ongoingContributions/',
        agendaUrl: '/agenda/ongoingContributions/user/'+getUserId()+'/',
        container: '#contribList',
        template_file: 'contributions.html',
        template_name: '#contribution',
        empty_message: 'No contributions happening now.',
        sessionDay: false
    });

    var ongoingContributionsView = new SpeakerContribsListView({
        collection: new Events(),
        url: '/ongoingSimpleEvents/',
        agendaUrl: '/agenda/ongoingSimpleEvents/user/'+getUserId()+'/',
        container: '#eventList',
        template_file: 'events.html',
        template_name: '#simpleEventList',
        empty_message: 'No lectures happening now.',
        sessionDay: false
    });

});