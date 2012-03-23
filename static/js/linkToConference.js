$('#confLinkFromAgenda').live('click', function() {
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



$('#confLinkFromConf').live('click', function() {
    var daysListContainer = $('#list'),
    daysDetailContainer = $('#allpages'),
    daysListView,
    daysDetailView,
    slotsView,
    contributionsView;

    initConf($(this).attr('confId'));
    allDays = conferenceModel.get('days')
    inAgenda = loadAgenda();
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