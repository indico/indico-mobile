$('#eventHome').live('pagecreate', function(){

    visited = false;
    var ongoingContribs = getOngoingContributions();

    console.log(ongoingContribs)

    var ongoingContribsCollection = new Contributions(ongoingContribs);

    if (ongoingContribs.length === 0){
        ongoingContribsCollection = new Contributions();
    }

    $('#contribList').data('contributions', ongoingContribsCollection);
    $('#contribList').data('lastTime', '');
    $('#contribList').data('part', 0);

    var ongoingContributionsView = new OngoingContributionsView({
        viewContainer: $('#contribList'),
        create: true
    });

    ongoingContributionsView.render();
    $('#contribList').data('view', ongoingContributionsView);

    $(window).on('scroll', function() {
        if($(window).scrollTop() + $(window).height() > $('#eventHome').height()-150 &&
                $('#contribList').data('part') != -1) {
            ongoingContributionsView.options.create = false;
            ongoingContributionsView.render();
        }
    });

});