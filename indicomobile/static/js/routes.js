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
        var eventId, agenda;
        if (infoSplitted[0] == 'agenda'){
            agenda = true;
            eventId = infoSplitted[1];
        }
        else{
            agenda = false;
            eventId = infoSplitted[0];
        }

        addToHistory("/event/" + eventId);

        var eventView = new PageView({
                model: new Event(),
                url: '/event/'+eventId+'/',
                link: 'event_' + info,
                template_name: '#eventPage',
                agenda: agenda
            });

    },

    getSimpleEventView: function(info){

        var infoSplitted = info.split('_');
        var eventId, agenda;
        if (infoSplitted[0] == 'agenda'){
            agenda = true;
            eventId = infoSplitted[1];
        }
        else{
            agenda = false;
            eventId = infoSplitted[0];
        }

        addToHistory("/event/" + eventId);

        var eventView = new PageView({
                model: new Event(),
                url: "/event/" + eventId + '/',
                link: 'event_' + info,
                template_name: '#simpleEventPage',
                agenda: agenda
            });

    },

    getSessionsView: function(info){

        var infoSplitted = info.split('_');
        var eventId, agenda, url, agendaUrl;
        if (infoSplitted[0] == 'agenda'){
            agenda = true;
            eventId = infoSplitted[1];
            url = '/agenda/event/' + eventId + '/allsessions/user/'+getUserId()+'/';
        }
        else{
            agenda = false;
            eventId = infoSplitted[0];
            url = '/event/' + eventId + '/sessions/';
            agendaUrl = '/agenda/event/' + eventId + '/sessions/user/'+getUserId()+'/';
        }

        if ($('#sessions_' + info).length === 0){

            var pageContainer = $('body');
            var sessionsPageView = new PageView({
                model: new Event(),
                url: "/event/" + eventId + '/',
                link: 'sessions_' + info,
                template_name: '#sessionsPage',
                selectedTab: '#sessionsTab',
                agenda: agenda
            });

            var sessionsListView = new SessionsList({
                collection: new Slots(),
                url: url,
                agendaUrl: agendaUrl,
                container: '#sessionsList_' + info,
                template_name: '#sessionsList',
                empty_message: 'No sessions in this event.',
                agenda: agenda
            });

        }
        else{
            $.mobile.changePage('#sessions_' + info);
        }

    },

    getSessionView: function(info){

        var infoSplitted = info.split('_');
        var eventId, sessionId, agenda, url;
        if (infoSplitted[0] == 'agenda'){
            agenda = true;
            eventId = infoSplitted[1];
            sessionId = infoSplitted[2];
            url = '/agenda/event/' + eventId + '/session/' + sessionId + '/entries/user/'+getUserId()+'/';
        }
        else{
            agenda = false;
            eventId = infoSplitted[0];
            sessionId = infoSplitted[1];
            url = '/event/' + eventId + '/session/' + sessionId + '/entries/';
        }

        if ($('#session_' + info).length === 0){

            var pageContainer = $('body');
            var sessionView = new PageView({
                model: new Slot(),
                url: '/event/' + eventId + '/session/' + sessionId + '/',
                link: 'session_' + info,
                template_name: '#sessionPage',
                selectedTab: null,
                agenda: agenda
            });

            var sessionDaysView = new SessionDaysList({
                collection: new Slots(),
                url: url,
                container: '#sessionDays_' + info,
                template_name: '#sessionDaysList',
                empty_message: 'There is nothing in this session.',
                agenda: agenda
            });

        }
        else{
            $.mobile.changePage('#session_' + info);
        }

    },

    getSessionDay: function(info){

        var infoSplitted = info.split('_');
        var eventId, sessionId, agenda, url, day, agendaUrl;
        if (infoSplitted[0] == 'agenda'){
            agenda = true;
            eventId = infoSplitted[1];
            sessionId = infoSplitted[2];
            day = infoSplitted[3];
            url = '/agenda/event/' + eventId + '/session/' + sessionId + '/day/'
                + day + '/contribs/user/' + getUserId() + '/';
        }
        else{
            agenda = false;
            eventId = infoSplitted[0];
            sessionId = infoSplitted[1];
            day = infoSplitted[2];
            url = '/event/' + eventId + '/session/' + sessionId + '/day/' + day + '/contribs/';
            agendaUrl = '/agenda/event/' + eventId + '/session/' +
                            sessionId + '/day/' + day + '/contribs/user/'+getUserId()+'/';
        }

        if ($('#sessionDay_' + info).length === 0){

            var sessionDayView = new SearchContributionsView({
                model: new Slot(),
                url: '/event/'+eventId+'/day/'+day+'/session/'+sessionId+'/',
                template_name: '#sessionDay',
                link: 'sessionDay_' + info,
                selectedTab: null,
                agenda: agenda
            });

            var contributionsView = new ContributionListView({
                collection: new Contributions(),
                url: url,
                agendaUrl: agendaUrl,
                container: '#sessionDay_list_' + info,
                template_name: '#contribution',
                sessionDay: true,
                empty_message: 'There is nothing in this day.',
                agenda: agenda
            });

        }
        else{
            $.mobile.changePage('#sessionDay_' + info);
        }

    },


    getTimetableView: function(info){
        var infoSplitted = info.split('_');
        var eventId, agenda;
        if (infoSplitted[0] == 'agenda'){
            agenda = true;
            eventId = infoSplitted[1];
            url = '/agenda/event/' + eventId + '/days/user/'+ getUserId() + '/';
        }
        else{
            agenda = false;
            eventId = infoSplitted[0];
            url = '/event/' + eventId + '/days/';
        }

        if ($('#timetable_' + info).length === 0){

            var timetableDaysView = new PageView({
                model: new Event(),
                url: '/event/' + eventId + '/',
                template_name: '#timetableDays',
                link: 'timetable_' + info,
                selectedTab: '#timetableTab',
                agenda: agenda
            });

            var timetableDaysListView = new ListView({
                collection: new Days(),
                url: url,
                container: '#timetable_days_' + info,
                template_name: '#timetableDaysList',
                empty_message: 'No contributions in this event.',
                agenda: agenda
            });

        }
        else{
            $.mobile.changePage('#timetable_' + info);
        }
    },

    getTimetableDayView: function(info){

        var infoSplitted = info.split('_');

        var agenda, eventId, dayDate, url, agendaUrl;
        if (infoSplitted[0] == 'agenda'){
            agenda = true;
            eventId = infoSplitted[1];
            dayDate = infoSplitted[2];
            url = '/agenda/event/'+eventId+'/day/'+dayDate+'/contributions/user/'+getUserId()+'/';
        }
        else{
            agenda = false;
            eventId = infoSplitted[0];
            dayDate = infoSplitted[1];
            url = '/event/'+eventId+'/day/'+dayDate+'/contributions/';
            agendaUrl = '/agenda/event/'+eventId+'/day/'+dayDate+'/contributions/user/'+getUserId()+'/';
        }

        if ($('#timetableDay_' + info).length === 0){

            var timetableDayView = new SearchContributionsView({
                model: new Day(),
                url: '/event/' + eventId + '/day/' + dayDate + '/',
                template_name: '#dayPage',
                link: 'timetableDay_' + info,
                selectedTab: null,
                agenda: agenda
            });

            var timetableDayContributionsView = new ContributionListView({
                container: '#day_list_' + info,
                collection: new Contributions(),
                url: url,
                agendaUrl: agendaUrl,
                template_name: '#contribution',
                sessionDay: false,
                empty_message: 'There is nothing in this day.',
                agenda: agenda
            });
        }
        else {
            $.mobile.changePage('#timetableDay_' + info);
            
        }

    },

    getSpeakersView: function(info){

        var infoSplitted = info.split('_');

        if ($('#speakers_' + info).length === 0){

            var eventId, agenda;
            if (infoSplitted[0] == 'agenda'){
                agenda = true;
                eventId = infoSplitted[1];
                url = '/agenda/event/' + eventId + '/speakers/user/'+getUserId()+'/';
            }
            else{
                agenda = false;
                eventId = infoSplitted[0];
                url = '/event/' + eventId + '/speakers/';
            }

            var speakersPageView = new SpeakersPage({
                model: new Event(),
                url: '/event/' + eventId + '/',
                template_name: '#speakersPage',
                link: 'speakers_' + info,
                selectedTab: '#speakersTab',
                agenda: agenda
            });

            var speakersListView = new SpeakerListView({
                collection: new Speakers(),
                url: url,
                container: '#speakersContent_' + info,
                lastIndex: null,
                template_name: '#speakersList',
                agenda: agenda
            });
        }
        else{
            $.mobile.changePage('#speakers_' + info);
        }

    },

    getSpeakerView: function(info){
        var infoSplitted = info.split('_');

        if ($('div[id="speaker_' + info +'"]').length === 0){

            var eventId, speakerId, agenda, url, agendaUrl;

            if (infoSplitted[0] == 'agenda'){
                agenda = true;
                eventId = infoSplitted[1];
                speakerId = infoSplitted[2].replace(':','_');
                url = "/agenda/event/" + eventId + "/speaker/" + speakerId + "/contributions/user/"+getUserId()+'/';
            }
            else{
                agenda = false;
                eventId = infoSplitted[0];
                speakerId = infoSplitted[1].replace(':','_');
                url = "/event/" + eventId + "/speaker/" + speakerId + "/contributions/";
            }

            var speakerPageView = new PageView({
                model: new Speaker(),
                url: "/event/" + eventId + "/speaker/" + speakerId + '/',
                agendaUrl: "/agenda/event/" + eventId + "/speaker/" +
                    speakerId + "/contributions/user/"+getUserId()+'/',
                event_id: eventId,
                template_name: '#speakerPage',
                link: 'speaker_' + info,
                selectedTab: null,
                agenda: agenda
            });

            var speakerContributionsView = new SpeakerContribsListView({
                container: 'div[id="speaker_contribs_' + info +'"]',
                collection: new Contributions(),
                url: url,
                agendaUrl: agendaUrl,
                template_name: '#contribution',
                empty_message: 'This speaker is in no contribution.',
                agenda: agenda
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

            var eventId, contributionId, agenda;

            if (infoSplitted[0] == 'agenda'){
                agenda = true;
                eventId = infoSplitted[1];
                contributionId = infoSplitted[2];
            }
            else{
                agenda = false;
                eventId = infoSplitted[0];
                contributionId = infoSplitted[1];
            }

            var contributionPageView = new PageView({
                model: new Contribution(),
                url: '/event/' + eventId + '/contrib/' + contributionId + '/',
                template_name: '#contributionDetail',
                link: 'contribution_' + info,
                selectedTab: '#any',
                agenda: agenda
            });

        }
        else{
            $.mobile.changePage('#contribution_' + info);
        }

    },

    getAboutView: function(info){

        var infoSplitted = info.split('_');

        var eventId;

        if (infoSplitted[0] == 'agenda'){
            eventId = info.split('_')[1];
        }
        else{
            eventId = info.split('_')[0];
        }

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

function getUserId() {
    return 1;
}

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