contribsViewed = [];

$('div[info="sessionCol"]').live('click', function() {
    var isFirst = true;
    for(session in contribsViewed) {
        if(contribsViewed[session] == $(this).attr('sessionId')) {
            isFirst = false;
        }
    }
    if(isFirst) {
        var contributionsView = new ContributionView({
            collection : conferenceModel,
            date : $(this).attr('day'),
            session : $(this).attr('sessionId'),
            part : 0
        });
        contributionsView.render();
        contribsViewed[contribsViewed.length] = $(this).attr('sessionId');
    }
});