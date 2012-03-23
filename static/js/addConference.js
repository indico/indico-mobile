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
