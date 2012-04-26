var Router = Backbone.Router.extend({

    routes: {
        "event_:info": "getEventView",
        "day_:info": "getDayView"
    },

    getEventView: function(info){

        var infoSplitted = info.split('_');
        var agenda = false;
        if (infoSplitted.length > 1){
            agenda = true;
        }
        var id = infoSplitted[0];

        if ($('#event_' + info).length === 0){

            var eventInfo = getEvent(id);
            $('#headerTitle').html($(this).html());

            addToHistory(id);

            var eventView = new EventView({
                event: eventInfo,
                agenda: agenda
            });
            eventView.render();

            var create = false;
            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#event_' + info);
                create = true;
            }

            var daysCollection;
            if (agenda){
                daysCollection = new Days(loadAgendaDays().filter(function(day){
                    return day.get('eventId') == id;
                }));
            }
            else{
                daysCollection = getDays(id);
            }

            var eventDaysView = new EventDaysView({
                collection: daysCollection,
                viewContainer: $('#event_days_' + info),
                create: create,
                eventId: id,
                agenda: agenda
            });
            eventDaysView.render();
        }
        else{
            $.mobile.changePage('#event_' + info);
        }
    },

    getDayView: function(info){

        var infoSplitted = info.split('_');
        var id = infoSplitted[0];
        var date = infoSplitted[1];
        var agenda = false;
        if (infoSplitted.length > 2){
            agenda = true;
        }

        if ($('#day_' + info).length === 0){

            var daysCollection;
            if (agenda){
                daysCollection = new Days(loadAgendaDays().filter(function(day){
                    return day.get('eventId') == id;
                }));
            }
            else{
                daysCollection = getDays(id);
            }

            var day = getDay(id, date);

            var dayDetailView = new DayDetailView({
                day: day,
                agenda: agenda
            });
            dayDetailView.render();

            var create = false;
            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#day_' + info);
                create = true;
            }

            var daysListView = new SideDaysView({
                collection: daysCollection,
                viewContainer: $('#listInDay_' + info),
                date: date,
                create: create,
                agenda: agenda
            });
            daysListView.render();


            var sessionsCollection;
            if (agenda){
                sessionsCollection = new Slots(loadAgendaSessions().filter(function(session){
                    return session.get('eventId') == id;
                }));
            }
            else{
                sessionsCollection = getDaySessions(id, date);
            }
            if ($('#sessionInDay_' + info).html() === ''){
            var slotsView = new SlotsView({
                container: $('#sessionInDay_' + info),
                collection: sessionsCollection,
                date: date,
                eventId: id,
                create: create,
                agenda: agenda
            });
            slotsView.render();
            }
        }
        else{
            $.mobile.changePage('#day_' + info);
        }
    }

});

var router = new Router();
Backbone.emulateHTTP = true;
Backbone.emulateJSON = true;
Backbone.history.start();