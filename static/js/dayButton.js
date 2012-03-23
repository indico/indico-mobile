$('a[id="dayButton"]').live('click', function(event) {
    var date = $(this).html();
    console.log(date);
    var daysListContainer = $('#listInDay-' + date);
    $.mobile.changePage($(this).attr('href'), {
        transition : 'fade',
        reverse : true
    });
    var daysListView = new DaysListView({
        collection : conferenceModel,
        viewContainer : daysListContainer,
        date : date
    });
    daysListView.render();
});