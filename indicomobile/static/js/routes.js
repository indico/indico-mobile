function addToHistory(url){
    var newEvent = new Event();
    newEvent.url = url;
    newEvent.on('change', function (eventToAdd){
        var myHistory = loadHistory();
        myHistory.comparator = function(event){
            return parseInt(event.get('viewedAt'), 10);
        };
        myHistory.sort();
        var now = new Date();

        var eventInHistory = myHistory.find(function(currentEvent){
            return currentEvent.get('id') == eventToAdd.get('id');
        });

        if (eventInHistory){
            myHistory.remove(eventInHistory);
            eventInHistory.set('viewedAt', now.getTime());
            myHistory.add(eventInHistory);
        }
        else{
            if (myHistory.size() >= 10){
                myHistory.remove(myHistory.at(0));
                myHistory.add(eventToAdd);
            }
            else{
                eventToAdd.set('viewedAt', now.getTime());
                myHistory.add(eventToAdd);
            }
        }
        localStorage.setItem('myHistory', JSON.stringify(myHistory.toJSON()));
    });
    newEvent.fetch();
}

var Router = Backbone.Router.extend({

    routes: {
        "event_:info": "getEventView",
        "sessions_:info": "getSessionsView",
        "session_:info": "getSessionView",
        "sessionDay_:info": "getSessionDay",
        "timetable_:info": "getTimetableView",
        "timetableDay_:info": "getTimetableDayView",
        "speakers_:info": "getSpeakersView",
        "speaker_:info": "getSpeakerView",
        "contribution_:info": "getContributionView",
        "about_:info": "getAboutView"
    },

    getEventView: function(info){

        var infoSplitted = info.split('_');
        var agenda = false;
        if (infoSplitted.length > 1){
            agenda = true;
        }
        var eventId = infoSplitted[0];

        addToHistory("/event/" + eventId);

        var eventView = new EventView({
                model: new Event(),
                url: "/event/" + eventId,
                agenda: agenda,
                page: '#event_' + info
            });

        var create = false;
        if (typeof $.mobile.activePage !== "undefined"){
            $.mobile.changePage('#event_' + info);
            create = true;
        }

    },

    getSessionsView: function(info){

        var infoSplitted = info.split('_');
        var agenda = false;
        if (infoSplitted.length > 1){
            agenda = true;
        }
        var eventId = infoSplitted[0];

        if ($('#sessions_' + info).length === 0){

            var create = true;

            var pageContainer = $('body');
            var sessionsPageView = new SessionsPageView({
                model: new Event(),
                url: "/event/" + eventId,
                container: pageContainer,
                agenda: agenda,
                page: '#sessions_' + info
            });

            var sessionsListView = new SessionsListView({
                collection: new Slots(),
                url: "/event/" + eventId + "/sessions",
                container: '#sessions_list_' + info,
                agenda: agenda
            });

            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#sessions_' + info);
                create = true;
            }
        }
        else{
            $.mobile.changePage('#sessions_' + info);
        }

    },

    getSessionView: function(info){

        var infoSplitted = info.split('_');
        var agenda = false;
        if (infoSplitted.length > 2){
            agenda = true;
        }
        var eventId = infoSplitted[0];
        var sessionId = infoSplitted[1];

        if ($('#session_' + info).length === 0){

            var create = true;

            var pageContainer = $('body');
            var sessionView = new SessionView({
                model: new Slot(),
                url: 'event/' + eventId + '/samesession/' + sessionId,
                container: pageContainer,
                agenda: agenda,
                page: '#session_' + info
            });

            var sessionDaysView = new SessionDaysView({
                collection: new Slots(),
                url: 'event/' + eventId + '/sessions/' + sessionId,
                container: '#session_days_' + info,
                agenda: agenda,
                create: create
            });

            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#session_' + info);
            }
        }
        else{
            $.mobile.changePage('#session_' + info);
        }

    },

    getSessionDay: function(info){

        var infoSplitted = info.split('_');
        var agenda = false;
        if (infoSplitted.length > 3){
            agenda = true;
        }
        var eventId = infoSplitted[0];
        var sessionId = infoSplitted[1];
        var day = infoSplitted[2];

        var container;

        if ($('#sessionDay_' + info).length === 0){
            var create = true;
            var pageContainer = $('body');
            var contribution = new Contribution({'eventId': eventId, 'sessionId': sessionId, 'dayDate': day});
            var sessionDayView = new SessionDayView({
                contribution: contribution,
                container: pageContainer,
                agenda: agenda
            });
            sessionDayView.render();

            container = $('#sessionDay_list_' + info);
            container.data('lastTime', '');
            var contributionsView = new SessionDayContributions({
                collection: new Contributions(),
                url: '/event/' + eventId + '/session/' + sessionId + '/day/' + day + '/contribs',
                container: '#sessionDay_list_' + info,
                agenda: agenda,
                create: create
            });

            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#sessionDay_' + info);
            }
        }
        else{
            $.mobile.changePage('#sessionDay_' + info);
        }

    },


    getTimetableView: function(info){
        var infoSplitted = info.split('_');
        var agenda = false;
        if (infoSplitted.length > 1){
            agenda = true;
        }
        var eventId = infoSplitted[0];

        if ($('#timetable_' + info).length === 0){

            var pageContainer = $('body');
            var timetableDaysView = new TimetableDaysView({
                model: new Event,
                url: 'event/' + eventId,
                container: pageContainer,
                agenda: agenda,
                page: '#timetable_' + info
            });

            var timetableDaysListView = new TimetableDaysListView({
                collection: new Days(),
                url: '/event/' + eventId + '/days',
                container: '#timetable_days_' + info,
                agenda: agenda
            });

            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#timetable_' + info);
            }
        }
        else{
            $.mobile.changePage('#timetable_' + info);
        }
    },

    getTimetableDayView: function(info){

        var infoSplitted = info.split('_');
        var agenda = false;
        if (infoSplitted.length > 2){
            agenda = true;
        }
        var eventId = infoSplitted[0];
        var dayDate = infoSplitted[1];
        if ($('#timetableDay_' + info).length === 0){

            var create = true;

            var pageContainer = $('body');
            var timetableDayView = new TimetableDayView({
                day: new Day(),
                event: new Event(),
                dayUrl: '/event/' + eventId + '/day/' + dayDate,
                eventUrl: 'event/' + eventId,
                container: pageContainer,
                agenda: agenda,
                page: '#timetableDay_' + info
            });
            var container = $('#day_list_' + info);
            container.data('lastTime', '');
            container.data('lastPosterTime', '');
            var timetableDayContributionsView = new TimetableDayContributionsView({
                container: '#day_list_' + info,
                collection: new Contributions(),
                url: '/event/'+eventId+'/day/'+dayDate+'/contributions',
                create: create,
                agenda: agenda
            });

            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#timetableDay_' + info);
            }
        }
        else {
            $.mobile.changePage('#timetableDay_' + info);
            
        }

    },

    getSpeakersView: function(info){
        var infoSplitted = info.split('_');

        var agenda = false;
        if (infoSplitted.length > 1){
            agenda = true;
        }

        var create = true;
        var container;
        if ($('#speakers_' + info).length === 0){
            var eventId = infoSplitted[0];

            var speakersPageView = new SpeakersPageView({
                model: new Event(),
                url: '/event/' + eventId,
                agenda: agenda,
                page: '#speakers_' + info
            });

            container = $('#speakersContent_' + info);
            container.data('firstLetter', '');

            speakers = new Speakers();
            var speakersListView = new SpeakersListView({
                collection: new Speakers(),
                url: '/event/'+eventId+'/speakers',
                agenda: agenda,
                eventId: eventId,
                create: create,
                container: '#speakersContent_' + info
            });
        }
        else{
            $.mobile.changePage('#speakers_' + info);
        }

    },

    getSpeakerView: function(info){
        var infoSplitted = info.split('_');

        var agenda = false;
        if (infoSplitted.length > 2){
            agenda = true;
        }

        if ($('div[id="speaker_' + info +'"]').length === 0){

            var create = true;

            var eventId = infoSplitted[0];
            var speakerId = infoSplitted[1].replace(':','_');
            var speakerPageView = new SpeakerPageView({
                speaker: new Speaker(),
                speakerUrl: "/event/" + eventId + "/speaker/" + speakerId,
                event: new Event(),
                eventUrl: '/event/'+eventId,
                agenda: agenda,
                page:'div[id="speaker_' + info +'"]'
            });

            var speakerContributionsView = new SpeakerContributionsView({
                container: 'div[id="speaker_contribs_' + info +'"]',
                collection: new Contributions(),
                url: "/event/" + eventId + "/speaker/" + speakerId + "/contributions",
                agenda: agenda,
                create: create
            });
        }
        else{
            $.mobile.changePage($('div[id="speaker_' + info +'"]'));
        }
    },

    getContributionView: function(info){

        var infoSplitted = info.split('_');

        var agenda = false;
        if (infoSplitted.length > 2){
            agenda = true;
        }

        addToHistory('/event/'+infoSplitted[0]);

        if ($('#contribution_' + info).length === 0){
            var eventId = infoSplitted[0];
            var contributionId = infoSplitted[1];

            var contributionPageView = new ContributionPageView({
                contribution: new Contribution(),
                contributionUrl: '/event/' + eventId + '/contrib/' + contributionId,
                event: new Event(),
                eventUrl: '/event/' + eventId,
                page: '#contribution_' + info
            });
        }
        else{
            $.mobile.changePage('#contribution_' + info);
        }

    },

    getAboutView: function(info){

        var eventId = info.split('_')[0];

        var agenda = false;
        if (info.split('_').length > 1){
            agenda = true;
        }

        if ($('#about_' + info).length === 0){

            var aboutPageView = new AboutPageView({
                model: new Event(),
                url: '/event/'+eventId,
                agenda: agenda,
                page: '#about_' + info
            });
        }
        else{
            $.mobile.changePage('#about_' + info);
        }

    }

});

//source: http://code18.blogspot.ch/2009/07/creer-un-singleton-en-javascript.html
function myAgenda() {
    
    this.events = loadAgendaEvents();
    this.days = loadAgendaDays();
    this.completeSessions = loadAgendaCompleteSessions();
    this.sessions = loadAgendaSessions();
    this.contributions = loadAgendaContributions();

    if (myAgenda.caller != myAgenda.getInstance){
        throw new Error("This object cannot be instanciated");
    }
}

myAgenda.instance = null;

myAgenda.getInstance = function() {
    if (this.instance == null) {
        this.instance = new myAgenda();
    }
    return this.instance;
}

$('a[rel="external"]').live('click', function(e){
    $.mobile.showPageLoadingMsg("a", "Loading...", true);
});

$('div[data-role="page"]').live('pageshow', function(e){
    $.mobile.hidePageLoadingMsg();
});

$.mobile.defaultPageTransition = 'none';
var router = new Router();
Backbone.emulateHTTP = true;
Backbone.emulateJSON = true;
Backbone.history.start();