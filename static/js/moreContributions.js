$('a[id="more"]').live('click', function(event) {
    $.mobile.showPageLoadingMsg();
    $(this).hide();
    var contributionsView = new ContributionView({
        collection : conferenceModel,
        date : $(this).attr('day'),
        session : $(this).attr('sessionId'),
        part : $(this).attr('value')
    });
    contributionsView.render();
});