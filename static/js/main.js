var firstTime = true;
contribsViewed = [];

$('#confButton').live('click', function() {
		var daysListContainer = $('#list'),
		daysDetailContainer = $('#allpages'),
		daysListView,
		daysDetailView,
		slotsView,
		contributionsView;

		initConf($('#confIdInput').val());
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

$('#confLink').live('click', function() {
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

$('a[href="#alldays"]').live('click', function(event) {
	$.mobile.changePage('#alldays', {
		transition : 'slide',
		reverse : true
	});
});
