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
        var eventId, favorites;
        if (infoSplitted[0] == 'favorites'){
            favorites = true;
            eventId = infoSplitted[1];
        }
        else{
            favorites = false;
            eventId = infoSplitted[0];
        }

        addToHistory(eventId);

        var eventView = new PageView({
                model: new Event(),
                url: BASE_URL + 'services/event/'+eventId+'/',
                link: 'event_' + info,
                template_name: '#eventPage',
                template_name2: '#simpleEventPage',
                favorites: favorites
            });

    },

    getSimpleEventView: function(info){

        var infoSplitted = info.split('_');
        var eventId, favorites;
        if (infoSplitted[0] == 'favorites'){
            favorites = true;
            eventId = infoSplitted[1];
        }
        else{
            favorites = false;
            eventId = infoSplitted[0];
        }

        addToHistory(eventId);

        var eventView = new PageView({
                model: new Event(),
                url: BASE_URL + "services/event/" + eventId + '/',
                link: 'event_' + info,
                template_name: '#simpleEventPage',
                favorites: favorites
            });

    },

    getSessionsView: function(info){

        var infoSplitted = info.split('_');
        var eventId, favorites, url, favoritesUrl;
        if (infoSplitted[0] == 'favorites'){
            favorites = true;
            eventId = infoSplitted[1];
            url = BASE_URL + 'services/favorites/event/' + eventId + '/allsessions/';
        }
        else{
            favorites = false;
            eventId = infoSplitted[0];
            url = BASE_URL + 'services/event/' + eventId + '/sessions/';
            favoritesUrl = BASE_URL + 'services/favorites/event/' + eventId + '/sessions/';
        }

        if ($('#sessions_' + info).length === 0){

            var pageContainer = $('body');
            var sessionsPageView = new PageView({
                model: new Event(),
                url: BASE_URL + "services/event/" + eventId + '/',
                link: 'sessions_' + info,
                template_name: '#sessionsPage',
                selectedTab: '#sessionsTab',
                favorites: favorites
            });

            var sessionsListView = new SessionsList({
                collection: new Slots(),
                url: url,
                favoritesUrl: favoritesUrl,
                container: '#sessionsList_' + info,
                template_name: '#sessionsList',
                empty_message: 'No sessions in this event',
                favorites: favorites
            });

        }
        else{
            $.mobile.changePage('#sessions_' + info);
        }

    },

    getSessionView: function(info){

        var infoSplitted = info.split('_');
        var eventId, sessionId, favorites, url;
        if (infoSplitted[0] == 'favorites'){
            favorites = true;
            eventId = infoSplitted[1];
            sessionId = infoSplitted[2];
            url = BASE_URL + 'services/favorites/event/' + eventId + '/session/' + sessionId + '/entries/';
        }
        else{
            favorites = false;
            eventId = infoSplitted[0];
            sessionId = infoSplitted[1];
            url = BASE_URL + 'services/event/' + eventId + '/session/' + sessionId + '/entries/';
        }

        if ($('#session_' + info).length === 0){

            var pageContainer = $('body');
            var sessionView = new PageView({
                model: new Slot(),
                url: BASE_URL + 'services/event/' + eventId + '/session/' + sessionId + '/',
                link: 'session_' + info,
                template_name: '#sessionPage',
                selectedTab: null,
                favorites: favorites
            });

            var sessionDaysView = new SessionDaysList({
                collection: new Slots(),
                url: url,
                container: '#sessionDays_' + info,
                template_name: '#sessionDaysList',
                empty_message: 'There is nothing in this session',
                favorites: favorites
            });

        }
        else{
            $.mobile.changePage('#session_' + info);
        }

    },

    getSessionDay: function(info){

        var infoSplitted = info.split('_');
        var eventId, sessionId, favorites, url, url1, day, favoritesUrl;
        if (infoSplitted[0] == 'favorites'){
            favorites = true;
            eventId = infoSplitted[1];
            sessionId = infoSplitted[2];
            day = infoSplitted[3];
            url = BASE_URL + 'services/favorites/event/' + eventId + '/session/' + sessionId + '/day/' +
                day + '/contribs/';
            url1 = BASE_URL + 'services/favorites/event/' + eventId + '/session/' + sessionId + '/entries/';
        }
        else{
            favorites = false;
            eventId = infoSplitted[0];
            sessionId = infoSplitted[1];
            day = infoSplitted[2];
            url = BASE_URL + 'services/event/' + eventId + '/session/' + sessionId + '/day/' + day + '/contribs/';
            favoritesUrl = '/services/favorites/event/' + eventId + '/session/' +
                            sessionId + '/day/' + day + '/contribs/';
            url1 = BASE_URL + 'services/event/' + eventId + '/session/' + sessionId + '/entries/';
        }

        if ($('#sessionDay_' + info).length === 0){

            var sessionDayView = new ContributionsPageView({
                collection: new Slots(),
                url: url1,
                contextUrl: BASE_URL + 'services/event/'+eventId+'/',
                day: day,
                template_name: '#sessionDay',
                link: 'sessionDay_' + info,
                selectedTab: null,
                favorites: favorites
            });

            var contributionsView = new ContributionListView({
                collection: new Contributions(),
                url: url,
                favoritesUrl: favoritesUrl,
                container: '#sessionDay_list_' + info,
                template_name: '#contribution',
                sessionDay: true,
                empty_message: 'There is nothing in this day',
                favorites: favorites
            });

        }
        else{
            $.mobile.changePage('#sessionDay_' + info);
        }

    },


    getTimetableView: function(info){
        var infoSplitted = info.split('_');
        var eventId, favorites;
        if (infoSplitted[0] == 'favorites'){
            favorites = true;
            eventId = infoSplitted[1];
            url = BASE_URL + 'services/favorites/event/' + eventId + '/days/';
        }
        else{
            favorites = false;
            eventId = infoSplitted[0];
            url = BASE_URL + 'services/event/' + eventId + '/days/';
        }

        if ($('#timetable_' + info).length === 0){

            var timetableDaysView = new PageView({
                model: new Event(),
                url: BASE_URL + 'services/event/' + eventId + '/',
                template_name: '#timetableDays',
                link: 'timetable_' + info,
                selectedTab: '#timetableTab',
                favorites: favorites
            });

            var timetableDaysListView = new ListView({
                collection: new Days(),
                url: url,
                container: '#timetable_days_' + info,
                template_name: '#timetableDaysList',
                empty_message: 'No contributions in this event',
                favorites: favorites
            });

        }
        else{
            $.mobile.changePage('#timetable_' + info);
        }
    },

    getTimetableDayView: function(info){

        var infoSplitted = info.split('_');

        var favorites, eventId, day, url, url1, favoritesUrl;
        if (infoSplitted[0] == 'favorites'){
            favorites = true;
            eventId = infoSplitted[1];
            day = infoSplitted[2];
            url = BASE_URL + 'services/favorites/event/'+eventId+'/day/'+day+'/contributions/';
            url1 = BASE_URL + 'services/favorites/event/' + eventId + '/days/';
        }
        else{
            favorites = false;
            eventId = infoSplitted[0];
            day = infoSplitted[1];
            url = BASE_URL + 'services/event/'+eventId+'/day/'+day+'/contributions/';
            favoritesUrl = BASE_URL + 'services/favorites/event/'+eventId+'/day/'+day+'/contributions/';
            url1 = BASE_URL + 'services/event/' + eventId + '/days/';
        }

        if ($('#timetableDay_' + info).length === 0){

            var timetableDayView = new ContributionsPageView({
                collection: new Days(),
                url: url1,
                contextUrl: BASE_URL + 'services/event/'+eventId+'/',
                day: day,
                template_name: '#dayPage',
                link: 'timetableDay_' + info,
                selectedTab: null,
                favorites: favorites
            });

            var timetableDayContributionsView = new ContributionListView({
                container: '#day_list_' + info,
                collection: new Contributions(),
                url: url,
                favoritesUrl: favoritesUrl,
                template_name: '#contribution',
                sessionDay: false,
                empty_message: 'There is nothing in this day',
                favorites: favorites
            });
        }
        else {
            $.mobile.changePage('#timetableDay_' + info);

        }

    },

    getSpeakersView: function(info){

        var infoSplitted = info.split('_');

        if ($('#speakers_' + info).length === 0){

            var eventId, favorites;
            if (infoSplitted[0] == 'favorites'){
                favorites = true;
                eventId = infoSplitted[1];
                url = BASE_URL + 'services/favorites/event/' + eventId + '/speakers/';
            }
            else{
                favorites = false;
                eventId = infoSplitted[0];
                url = BASE_URL + 'services/event/' + eventId + '/speakers/';
            }

            var speakersPageView = new SpeakersPage({
                model: new Event(),
                url: BASE_URL + 'services/event/' + eventId + '/',
                template_name: '#speakersPage',
                link: 'speakers_' + info,
                selectedTab: '#speakersTab',
                favorites: favorites
            });

            var speakersListView = new SpeakerListView({
                collection: new Speakers(),
                url: url,
                container: '#speakersContent_' + info,
                lastIndex: null,
                template_name: '#speakersList',
                favorites: favorites
            });
        }
        else{
            $.mobile.changePage('#speakers_' + info);
        }

    },

    getSpeakerView: function(info){
        var infoSplitted = info.split('_');

        if ($('div[id="speaker_' + info +'"]').length === 0){

            var eventId, speakerId, favorites, url, favoritesUrl;

            if (infoSplitted[0] == 'favorites'){
                favorites = true;
                eventId = infoSplitted[1];
                speakerId = infoSplitted[2].replace(':','_');
                url = BASE_URL + "services/favorites/event/" + eventId + "/speaker/" + speakerId + "/contributions/";
            }
            else{
                favorites = false;
                eventId = infoSplitted[0];
                speakerId = infoSplitted[1].replace(':','_');
                url = "/services/event/" + eventId + "/speaker/" + speakerId + "/contributions/";
                favoritesUrl = BASE_URL + "services/favorites/event/" + eventId + "/speaker/" + speakerId + "/contributions/";
            }

            var speakerPageView = new PageView({
                model: new Speaker(),
                url: BASE_URL + "services/event/" + eventId + "/speaker/" + speakerId + '/',
                favoritesUrl: BASE_URL + "services/favorites/event/" + eventId + "/speaker/" +
                    speakerId + "/contributions/",
                event_id: eventId,
                template_name: '#speakerPage',
                link: 'speaker_' + info,
                selectedTab: null,
                favorites: favorites
            });

            var speakerContributionsView = new SimpleEventsAndContributions({
                container: 'div[id="speaker_contribs_' + info +'"]',
                collection: new Contributions(),
                url: url,
                favoritesUrl: favoritesUrl,
                template_name: '#contribution',
                empty_message: 'This speaker is in no contribution',
                favorites: favorites
            });
        }
        else{
            $.mobile.changePage($('div[id="speaker_' + info +'"]'));
        }
    },

    getContributionView: function(info){

        var infoSplitted = info.split('_');

        var eventId, contributionId, favorites;

        if (infoSplitted[0] == 'favorites'){
            favorites = true;
            eventId = infoSplitted[1];
            contributionId = infoSplitted[2];
        }
        else{
            favorites = false;
            eventId = infoSplitted[0];
            contributionId = infoSplitted[1];
        }

        addToHistory(eventId);

        if ($('#contribution_' + info).length === 0){

            var contributionPageView = new PageView({
                model: new Contribution(),
                url: BASE_URL + 'services/event/' + eventId + '/contrib/' + contributionId + '/',
                template_name: '#contributionDetail',
                link: 'contribution_' + info,
                selectedTab: '#any',
                favorites: favorites
            });

        }
        else{
            $.mobile.changePage('#contribution_' + info);
        }

    },

    getAboutView: function(info){

        var infoSplitted = info.split('_');

        var eventId, favorites;

        if (infoSplitted[0] == 'favorites'){
            favorites = true;
            eventId = info.split('_')[1];
        }
        else{
            favorites = false;
            eventId = info.split('_')[0];
        }

        if ($('#about_' + info).length === 0){

            var aboutPageView = new PageView({
                model: new Event(),
                url: BASE_URL + 'services/event/'+eventId+'/',
                template_name: '#about',
                link: 'about_' + info,
                selectedTab: '#aboutTab',
                favorites: favorites
            });
        }
        else{
            $.mobile.changePage('#about_' + info);
        }

    }

});

function getUserId() {
    var user_id = null;
    $.ajax({
            type: 'GET',
            url: BASE_URL + 'user_id/',
            async: false,
            success: function(resp){
                user_id = resp;
            }
        });
    return user_id;
}

function logout() {
    $.ajax({
            type: 'GET',
            url: BASE_URL + 'logout/',
            async: false,
            success: function(resp){
                window.location.href = resp;
            }
        });
}

$('a[href^="#event_"]').live('click', function(){
    $.mobile.showPageLoadingMsg('c', 'Loading page...', true);
});


$.mobile.defaultPageTransition = 'none';
var router = new Router();
Backbone.emulateHTTP = true;
Backbone.emulateJSON = true;
Backbone.history.start();