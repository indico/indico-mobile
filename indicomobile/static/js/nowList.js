$('#eventHome').live('pagecreate', function(){

    visited = false;

    var ongoingContributionsView = new ListView({
        collection: new Events(),
        url: '/ongoingContributions/',
        container: '#contribList',
        template_file: 'contributions.html',
        template_name: '#contribution'
    });

});