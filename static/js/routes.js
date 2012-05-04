var Router = Backbone.Router.extend({

    routes: {
        "event_:info": "getEventView",
        "sessions_:info": "getSessionsView",
        "session_:info": "getSessionView",
        "sessionDay_:info": "getSessionDay",
        "timetable_:info": "getTimetableView",
        "timetableDay_:info": "getTimetableDayView",
        "speakers_:info": "getSpeakersView",
        "speaker_:info": "getSpeakerView"
    },

    getEventView: function(info){

        var infoSplitted = info.split('_');
        var agenda = false;
        if (infoSplitted.length > 1){
            agenda = true;
        }
        var eventId = infoSplitted[0];

        var event = getEvent(eventId);

        console.log(eventId);

        var eventView = new EventView({
            event: event,
            agenda: agenda
        });
        eventView.render();

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
            var event = getEvent(eventId);

            var pageContainer = $('body');
            var sessionsPageView = new SessionsPageView({
                event: event,
                container: pageContainer,
                agenda: agenda
            });
            sessionsPageView.render();

            var sessions;
            if (agenda){
                sessions = new Slots(loadAgendaSessions().filter(function(session){
                    return session.get('eventId') == eventId;
                }));
            }
            else{
                sessions = getEventSessions(eventId);
            }
            console.log(sessions);
            var listContainer = $('#sessions_list_' + info);
            var sessionsListView = new SessionsListView({
                sessions: sessions,
                container: listContainer,
                agenda: agenda
            });
            sessionsListView.render();

            var create = false;
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
            var pageContainer = $('body');
            var sessions;
            if (agenda){
                sessions = new Slots(loadAgendaSessions().filter(function(session){
                    return session.get('eventId') == eventId &&
                    session.get('sessionId') == sessionId;
                }));
            }
            else {
                sessions = getEventSameSessions(eventId, sessionId);
            }
            var sessionView = new SessionView({
                session: sessions.at(0),
                container: pageContainer,
                agenda: agenda
            });
            sessionView.render();

            var create = true;

            var listContainer = $('#session_days_' + info);
            var sessionDaysView = new SessionDaysView({
                sessions: sessions,
                container: listContainer,
                agenda: agenda,
                create: create
            });
            sessionDaysView.render();
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

        if ($('#sessionDay_' + info).length === 0){
            var pageContainer = $('body');
            var contributions;
            if (agenda){
                contributions = new Contributions(loadAgendaContributions().filter(function(contrib){
                    return contrib.get('sessionId') == sessionId &&
                    contrib.get('eventId') == eventId &&
                    contrib.get('dayDate') == day;
                }));
            }
            else{
                contributions = new Contributions(getSessionContributions(eventId, sessionId).filter(function(contrib){
                    return contrib.get('dayDate') == day;
                }));
            }
            var contribution = new Contribution({'eventId': eventId, 'sessionId': sessionId, 'dayDate': day});
            console.log(contributions);
            var sessionDayView = new SessionDayView({
                contribution: contribution,
                container: pageContainer,
                agenda: agenda
            });
            sessionDayView.render();
            var contributionsView = new SessionDayContributions({
                contributions: contributions,
                container: $('#sessionDay_list_' + info),
                agenda: agenda,
                create: create
            });
            contributionsView.render();

            var create = false;
            if (typeof $.mobile.activePage !== "undefined"){
                create = true;
            }

            if (create){
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
            var event = getEvent(eventId);

            var pageContainer = $('body');
            var timetableDaysView = new TimetableDaysView({
                event: event,
                container: pageContainer,
                agenda: agenda
            });
            timetableDaysView.render();

            var sessions;
            if (agenda){
                sessions = loadAgendaSessions();
            }
            else{
                sessions = getEventSessions(eventId);
            }
            var listContainer = $('#timetable_days_' + info);
            console.log(listContainer)
            var timetableDaysListView = new TimetableDaysListView({
                sessions: sessions,
                container: listContainer,
                agenda: agenda
            });
            timetableDaysListView.render();

            var create = false;
            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#timetable_' + info);
                create = true;
            }
        }
        else{
            $.mobile.changePage('#timetable_' + info);
        }
    },

    getTimetableDayView: function(info){

        $.mobile.showPageLoadingMsg();
        var infoSplitted = info.split('_');
        var agenda = false;
        if (infoSplitted.length > 2){
            agenda = true;
        }
        var eventId = infoSplitted[0];
        var dayDate = infoSplitted[1];
        if ($('#timetableDay_' + info).length === 0){

            var create = true;
            var day = getDay(eventId, dayDate);
            var pageContainer = $('body');
            var timetableDayView = new TimetableDayView({
                day: day,
                container: pageContainer,
                agenda: agenda
            });
            timetableDayView.render();

            if(agenda){
                contributions = new Contributions(loadAgendaContributions().filter(function(contrib){
                    return contrib.get('eventId') == eventId &&
                    contrib.get('dayDate') == dayDate;
                }));
            }
            else{
                contributions = getDayContributions(eventId, dayDate);
            }
            var container = $('#day_list_' + info);
            container.data('part', 0);
            container.data('lastTime', '');
            var timetableDayContributionsView = new TimetableDayContributionsView({
                contributions: contributions,
                container: container,
                create: create,
                agenda: agenda
            });
            timetableDayContributionsView.render();

            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#timetableDay_' + info);
            }
        }
        else {
            $.mobile.changePage('#timetableDay_' + info);
        }

        $(window).scroll(function() {
            if(($(window).scrollTop() + $(window).height() >= $('#timetableDay_' + info).height()-50 ||
                    $(window).scrollTop() + $(window).height() > $('#timetableDay_' + info).height()) &&
                    $('#day_list_' + info).data('part') != -1) {
                if(agenda){
                    contributions = new Contributions(loadAgendaContributions().filter(function(contrib){
                        return contrib.get('eventId') == eventId &&
                        contrib.get('dayDate') == dayDate;
                    }));
                }
                else{
                    contributions = getDayContributions(eventId, dayDate);
                }
                var timetableDayContributionsView = new TimetableDayContributionsView({
                    contributions: contributions,
                    container: $('#day_list_' + info),
                    create: false,
                    agenda: agenda
                });
                timetableDayContributionsView.render();
            }
        });

    },

    getSpeakersView: function(info){
        var infoSplitted = info.split('_');

        var agenda = false;
        if (infoSplitted.length > 1){
            agenda = true;
        }

        var create = true;
        if ($('#speakers_' + info).length === 0){
            var eventId = infoSplitted[0];
            var speakers;
            if (agenda){
                var myEventContributions = new Contributions(
                        loadAgendaContributions().filter(function(contrib){
                            return contrib.get('eventId') == eventId;
                        })
                     );
                speakers = new Speakers();
                myEventContributions.each(function(contrib){
                    var currentSpeakers = contrib.get('presenters');
                    for (var i = 0; i < currentSpeakers.length; i++){
                        speakers.add(currentSpeakers[i]);
                    }
                });
            }
            else{
                speakers = getSpeakers(eventId);
            }


            var event = getEvent(eventId);

            var speakersPageView = new SpeakersPageView({
                event: event,
                agenda: agenda
            });
            speakersPageView.render();

            var container = $('#speakers_list_' + info);
            container.data('part', 0);
            container.data('firstLetter', '');
            container.data('speakers', speakers);
            var speakersListView = new SpeakersListView({
                speakers: speakers,
                agenda: agenda,
                create: create,
                container: $('#speakers_list_' + info)
            });
            speakersListView.render();

            $(window).scroll(function() {
                if(($(window).scrollTop() + $(window).height() >= $('#speakers_' + info).height()-50 ||
                        $(window).scrollTop() + $(window).height() > $('#speakers_' + info).height()) &&
                        $('#speakers_list_' + info).data('part') != -1) {
                    var speakersListView = new SpeakersListView({
                        speakers: container.data('speakers'),
                        container: $('#speakers_list_' + info),
                        agenda: agenda,
                        create: false
                    });
                    speakersListView.render();
                }
            });

            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#speakers_' + info);
            }
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

        var create = true;
        if ($('#speaker_' + info).length === 0){
            var eventId = infoSplitted[0];
            var speakerId = infoSplitted[1];

            var speaker = getSpeaker(eventId, speakerId);

            var speakerPageView = new SpeakerPageView({
                speaker: speaker,
                agenda: agenda
            });
            speakerPageView.render();

            var contributions = getSpeakerContributions(eventId, speakerId);

            var speakerContributionsView = new SpeakerContributionsView({
                container: $('#speaker_contribs_' + info),
                contributions: contributions,
                agenda: agenda,
                create: create
            });
            speakerContributionsView.render();


            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#speaker_' + info);
            }
        }
        else{
            $.mobile.changePage('#speaker_' + info);
        }
    }

});

$.mobile.defaultPageTransition = 'none';
var router = new Router();
Backbone.emulateHTTP = true;
Backbone.emulateJSON = true;
Backbone.history.start();