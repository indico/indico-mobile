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
        "simpleEvent_:info": "getSimpleEventView",
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

        var eventId = infoSplitted[0];

        addToHistory("/event/" + eventId);

        var eventView = new PageView({
                model: new Event(),
                url: "/event/" + eventId + '/',
                link: 'event_' + info,
                template_name: '#eventPage'
            });

    },

    getSimpleEventView: function(info){

        var infoSplitted = info.split('_');

        var eventId = infoSplitted[0];

        addToHistory("/event/" + eventId);

        var eventView = new PageView({
                model: new Event(),
                url: "/event/" + eventId + '/',
                link: 'event_' + info,
                template_name: '#simpleEventPage'
            });

    },

    getSessionsView: function(info){

        var infoSplitted = info.split('_');

        var eventId = infoSplitted[0];

        if ($('#sessions_' + info).length === 0){

            var pageContainer = $('body');
            var sessionsPageView = new PageView({
                model: new Event(),
                url: "/event/" + eventId + '/',
                link: 'sessions_' + info,
                template_name: '#sessionsPage',
                selectedTab: '#sessionsTab'
            });

            var sessionsListView = new ListView({
                collection: new Slots(),
                url: '/event/' + eventId + '/sessions/',
                container: '#sessions_list_' + info,
                template_name: '#sessionsList',
                empty_message: 'No sessions in this event.'
            });

        }
        else{
            $.mobile.changePage('#sessions_' + info);
        }

    },

    getSessionView: function(info){

        var infoSplitted = info.split('_');

        var eventId = infoSplitted[0];
        var sessionId = infoSplitted[1];

        if ($('#session_' + info).length === 0){

            var pageContainer = $('body');
            var sessionView = new PageView({
                model: new Slot(),
                url: 'event/' + eventId + '/session/' + sessionId + '/',
                link: 'session_' + info,
                template_name: '#sessionPage',
                selectedTab: '#sessionsTab'
            });

            var sessionDaysView = new SessionDaysList({
                collection: new Slots(),
                url: 'event/' + eventId + '/session/' + sessionId + '/entries/',
                container: '#session_days_' + info,
                template_name: '#sessionDaysList'
            });

        }
        else{
            $.mobile.changePage('#session_' + info);
        }

    },

    getSessionDay: function(info){

        var infoSplitted = info.split('_');

        var eventId = infoSplitted[0];
        var sessionId = infoSplitted[1];
        var day = infoSplitted[2];

        if ($('#sessionDay_' + info).length === 0){

            var sessionDayView = new SearchContributionsView({
                model: new Slot(),
                url: '/event/'+eventId+'/day/'+day+'/session/'+sessionId+'/',
                template_name: '#sessionDay',
                link: 'sessionDay_' + info,
                selectedTab: '#sessionsTab'
            });

            var contributionsView = new ContributionListView({
                collection: new Contributions(),
                url: '/event/' + eventId + '/session/' + sessionId + '/day/' + day + '/contribs/',
                container: '#sessionDay_list_' + info,
                template_name: '#contribution',
                sessionDay: true
            });

        }
        else{
            $.mobile.changePage('#sessionDay_' + info);
        }

    },


    getTimetableView: function(info){
        var infoSplitted = info.split('_');

        var eventId = infoSplitted[0];

        if ($('#timetable_' + info).length === 0){

            var timetableDaysView = new PageView({
                model: new Event(),
                url: 'event/' + eventId + '/',
                template_name: '#timetableDays',
                link: 'timetable_' + info,
                selectedTab: '#timetableTab'
            });

            var timetableDaysListView = new ListView({
                collection: new Days(),
                url: '/event/' + eventId + '/days/',
                container: '#timetable_days_' + info,
                template_name: '#timetableDaysList',
                empty_message: 'No contributions in this event.'
            });

        }
        else{
            $.mobile.changePage('#timetable_' + info);
        }
    },

    getTimetableDayView: function(info){

        var infoSplitted = info.split('_');

        var eventId = infoSplitted[0];
        var dayDate = infoSplitted[1];

        if ($('#timetableDay_' + info).length === 0){

            var timetableDayView = new SearchContributionsView({
                model: new Day(),
                url: '/event/' + eventId + '/day/' + dayDate + '/',
                template_name: '#dayPage',
                link: 'timetableDay_' + info,
                selectedTab: '#timetableTab'
            });

            var timetableDayContributionsView = new ContributionListView({
                container: '#day_list_' + info,
                collection: new Contributions(),
                url: '/event/'+eventId+'/day/'+dayDate+'/contributions/',
                template_name: '#contribution',
                sessionDay: false
            });
        }
        else {
            $.mobile.changePage('#timetableDay_' + info);
            
        }

    },

    getSpeakersView: function(info){

        var infoSplitted = info.split('_');

        if ($('#speakers_' + info).length === 0){

            var eventId = infoSplitted[0];

            var speakersPageView = new SpeakersPage({
                model: new Event(),
                url: '/event/' + eventId + '/',
                template_name: '#speakersPage',
                link: 'speakers_' + info,
                selectedTab: '#speakersTab'
            });

            var speakersListView = new SpeakerListView({
                collection: new Speakers(),
                url: '/event/' + eventId + '/speakers/',
                container: '#speakersContent_' + info,
                lastIndex: null,
                template_name: '#speakersList'
            });
        }
        else{
            $.mobile.changePage('#speakers_' + info);
        }

    },

    getSpeakerView: function(info){
        var infoSplitted = info.split('_');

        if ($('div[id="speaker_' + info +'"]').length === 0){

            var eventId = infoSplitted[0];
            var speakerId = infoSplitted[1].replace(':','_');

            var speakerPageView = new PageView({
                model: new Speaker(),
                url: "/event/" + eventId + "/speaker/" + speakerId + '/',
                event_id: eventId,
                template_name: '#speakerPage',
                link: 'speaker_' + info,
                selectedTab: '#speakersTab'
            });

            var speakerContributionsView = new SpeakerContribsListView({
                container: 'div[id="speaker_contribs_' + info +'"]',
                collection: new Contributions(),
                url: "/event/" + eventId + "/speaker/" + speakerId + "/contributions/",
                template_name: '#contribution'
            });
        }
        else{
            $.mobile.changePage($('div[id="speaker_' + info +'"]'));
        }
    },

    getContributionView: function(info){

        var infoSplitted = info.split('_');

        addToHistory('/event/'+infoSplitted[0]);

        if ($('#contribution_' + info).length === 0){

            var eventId = infoSplitted[0];
            var contributionId = infoSplitted[1];

            var contributionPageView = new PageView({
                model: new Contribution(),
                url: '/event/' + eventId + '/contrib/' + contributionId + '/',
                template_name: '#contributionDetail',
                link: 'contribution_' + info,
                selectedTab: '#any'
            });

        }
        else{
            $.mobile.changePage('#contribution_' + info);
        }

    },

    getAboutView: function(info){

        var eventId = info.split('_')[0];

        if ($('#about_' + info).length === 0){

            var aboutPageView = new PageView({
                model: new Event(),
                url: '/event/'+eventId,
                template_name: '#about',
                link: 'about_' + info,
                selectedTab: '#aboutTab'
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

$.mobile.defaultPageTransition = 'none';
var router = new Router();
Backbone.emulateHTTP = true;
Backbone.emulateJSON = true;
Backbone.history.start();