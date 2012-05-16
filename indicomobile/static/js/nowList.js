$('#eventHome').live('pagecreate', function(){

    visited = false;
    var ongoingContribs = getOngoingContributions();

    var ongoingContribsCollection = new Contributions(ongoingContribs);
    console.log(ongoingContribsCollection)

    if (ongoingContribs.length === 0){
        ongoingContribsCollection = new Contributions();
    }

    var ongoingContributionsView = new OngoingContributionsView({
        collection: ongoingContribsCollection,
        viewContainer: $('#contribList'),
        part: 0
    });
    ongoingContributionsView.render();
    $('#contribList').data('view', ongoingContributionsView);

});