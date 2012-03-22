var firstTime=true;
var contribsViewed = [];

$(document).live('pageinit', function(){
    var conferencesContainer = $('#confList'),
    conferencesView;
    myConferences = loadAgendaFromServer();
    console.log(myConferences);
    conferencesView = new ConferencesListView({
        collection : myConferences,
        viewContainer : conferencesContainer
    });
    conferencesView.render();
});

$('#confLink').live('click', function() {
    var daysListContainer = $('#list'),
    daysDetailContainer = $('#myagenda'),
    currentContrib = $(this).attr('confId'),
    daysListView,
    daysDetailView,
    slotsView,
    contributionsView;

    conferenceModel = myConferences.find(function(conf){
        return conf.get('id')==currentContrib;
    });
    allDays = conferenceModel.get('days')
    inAgenda = null;
    daysListView = new DaysListView({
        collection : conferenceModel,
        viewContainer : daysListContainer,
        date : ''
    });
    daysListView.render();
    daysDetailView = new DaysDetailView({
        collection : conferenceModel
    });
    daysDetailView.render();
    slotsView = new SlotsView({
        collection : conferenceModel
    });
    slotsView.render();
});

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

$('a[id="dayButton"]').live('click', function(event) {
    var date = $(this).html();
    var daysListContainer = $('#listInDay-' + date);
    $.mobile.changePage($(this).attr('href'), {
        transition : 'fade',
        reverse : true
    });
    daysListView = new DaysListView({
        collection : conferenceModel,
        viewContainer : daysListContainer,
        date : date
    });
    daysListView.render();
});

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