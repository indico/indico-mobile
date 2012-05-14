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
        "contribution_:info": "getContributionView"
    },

    getEventView: function(info){

        var infoSplitted = info.split('_');
        var agenda = false;
        if (infoSplitted.length > 1){
            agenda = true;
        }
        var eventId = infoSplitted[0];

        addToHistory(eventId);

        var event = getEvent(eventId);

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

            var create = true;

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

            var listContainer = $('#sessions_list_' + info);
            var sessionsListView = new SessionsListView({
                collection: sessions,
                container: listContainer,
                agenda: agenda
            });
            sessionsListView.render();

            sessionsListView.collection = new Slots();
            sessionsListView.render();

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

        var container;

        if ($('#sessionDay_' + info).length === 0){
            var create = true;
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
            var sessionDayView = new SessionDayView({
                contribution: contribution,
                container: pageContainer,
                agenda: agenda
            });
            sessionDayView.render();

            container = $('#sessionDay_list_' + info);
            container.data('contributions', contributions);
            container.data('part', 0);
            container.data('lastTime', '');
            var contributionsView = new SessionDayContributions({
                container: container,
                agenda: agenda,
                create: create
            });
            contributionsView.render();
            container.data('view', contributionsView);

            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#sessionDay_' + info);
            }

            $(window).on('scroll', function() {
                if($(window).scrollTop() + $(window).height() >= $('#sessionDay_' + info).height()-150 &&
                        container.data('part') != -1) {
                    contributionsView.options.create = false;
                    contributionsView.render();
                    var term = $('#searchContrib_' + info).val();
                    if (typeof term !== 'undefined' && term != '' && term != ' '){
                        for (word in term.split(' ')){
                            container.find('li').highlight(term.split(' ')[word]);
                        }
                    }
                }
            });
        }
        else{
            $.mobile.changePage('#sessionDay_' + info);
            container = $('#sessionDay_list_' + info);
            $(window).on('scroll', function() {
                if(container.data('part') != -1 &&
                        $(window).scrollTop() + $(window).height() >= $('#sessionDay_' + info).height()-150) {
                    container.data('view').options.create = false;
                    container.data('view').render();
                    var term = $('#searchContrib_' + info).val();
                    if (typeof term !== 'undefined' && term != '' && term != ' '){
                        for (word in term.split(' ')){
                            container.find('li').highlight(term.split(' ')[word]);
                        }
                    }
                }
            });
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
                sessions = new Slots(loadAgendaSessions().filter(function(session){
                    return session.get('eventId') == eventId;
                }));
            }
            else{
                sessions = getEventSessions(eventId);
            }
            var listContainer = $('#timetable_days_' + info);
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

        var infoSplitted = info.split('_');
        var agenda = false;
        if (infoSplitted.length > 2){
            agenda = true;
        }
        var eventId = infoSplitted[0];
        var dayDate = infoSplitted[1];
        var container;
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
                    return contrib.get('dayDate') == dayDate &&
                    contrib.get('eventId') == eventId;
                }));
             }
            else{
                contributions = getDayContributions(eventId, dayDate);
            }
            container = $('#day_list_' + info);
            container.data('part', 0);
            container.data('lastTime', '');
            container.data('lastPosterTime', '');
            container.data('contributions', contributions);
            var timetableDayContributionsView = new TimetableDayContributionsView({
                container: container,
                create: create,
                agenda: agenda
            });
            timetableDayContributionsView.render();
            container.data('view', timetableDayContributionsView);

            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#timetableDay_' + info);
            }

            $(window).on('scroll', function() {
                    if($('#day_list_' + info).data('part') != -1 &&
                            $(window).scrollTop() + $(window).height() >= $('#timetableDay_' + info).height()-150) {
                        timetableDayContributionsView.options.create = false;
                        timetableDayContributionsView.render();
                        var term = $('#searchContrib_' + info).val();
                        if (typeof term !== 'undefined' && term != '' && term != ' '){
                            for (word in term.split(' ')){
                                container.find('li').highlight(term.split(' ')[word]);
                            }
                        }
                    }
            });
        }
        else {
            $.mobile.changePage('#timetableDay_' + info);
            container = $('#day_list_' + info);
            $(window).on('scroll', function() {
                    if($('#day_list_' + info).data('part') != -1 &&
                            $(window).scrollTop() + $(window).height() >= $('#timetableDay_' + info).height()-150) {
                        container.data('view').options.create = false;
                        container.data('view').render();
                        var term = $('#searchContrib_' + info).val();
                        if (typeof term !== 'undefined' && term != '' && term != ' '){
                            for (word in term.split(' ')){
                                container.find('li').highlight(term.split(' ')[word]);
                            }
                        }
                    }

            });
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
                        var speakerAlreadyIn = speakers.find(function(speaker){
                            return speaker.get('id') == currentSpeakers[i].id;
                        });
                        if (!speakerAlreadyIn){
                            speakers.add(currentSpeakers[i]);
                        }
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

            container = $('#speakers_list_' + info);
            container.data('part', 0);
            container.data('firstLetter', '');
            container.data('speakers', speakers);
            var speakersListView = new SpeakersListView({
                collection: speakers,
                agenda: agenda,
                create: create,
                container: container
            });
            speakersListView.render();
            container.data('view', speakersListView);

            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#speakers_' + info);
            }

            $(window).on('scroll', function() {
                if(container.data('part') != -1 &&
                        $(window).scrollTop() + $(window).height() >= $('#speakers_' + info).height()-150) {
                    speakersListView.options.create = false;
                    speakersListView.render();
                    var term = $('#searchSpeaker_' + info).val();
                    if (typeof term !== 'undefined' && term != '' && term != ' '){
                        for (word in term.split(' ')){
                            container.find('li').highlight(term.split(' ')[word]);
                        }
                    }
                }
            });
        }
        else{
            $.mobile.changePage('#speakers_' + info);
            container = $('#speakers_list_' + info);
            $(window).on('scroll', function() {
                if(container.data('part') != -1 &&
                        $(window).scrollTop() + $(window).height() >= $('#speakers_' + info).height()-150) {
                    container.data('view').options.create = false;
                    container.data('view').render();
                    var term = $('#searchSpeaker_' + info).val();
                    if (typeof term !== 'undefined' && term != '' && term != ' '){
                        for (word in term.split(' ')){
                            container.find('li').highlight(term.split(' ')[word]);
                        }
                    }
                }
            });
        }

    },

    getSpeakerView: function(info){
        var infoSplitted = info.split('_');

        var agenda = false;
        if (infoSplitted.length > 2){
            agenda = true;
        }

        if ($('#speaker_' + info).length === 0){

            var create = true;

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
    },

    getContributionView: function(info){

        var infoSplitted = info.split('_');

        var agenda = false;
        if (infoSplitted.length > 2){
            agenda = true;
        }

        var create = true;
        if ($('#contribution_' + info).length === 0){
            var eventId = infoSplitted[0];
            var contributionId = infoSplitted[1];

            var contribution = getContribution(eventId, contributionId);

            var contributionPageView = new ContributionPageView({
                contribution: contribution,
                agenda: agenda
            });
            contributionPageView.render();


            if (typeof $.mobile.activePage !== "undefined"){
                $.mobile.changePage('#contribution_' + info);
            }
        }
        else{
            $.mobile.changePage('#contribution_' + info);
        }

    }

});

$('div[data-role="page"]').live('pagebeforehide', function(e){
    $(window).off('scroll');
});

$('a[href!="#"]').live('click', function(e){
    $.mobile.loadingMessageTextVisible = true;
    $.mobile.loadingMessage = "Loading... Please wait.";
    $.mobile.showPageLoadingMsg();
});

$('div[data-role="page"]').live('pageshow', function(e){
    $.mobile.hidePageLoadingMsg();
});

$.mobile.defaultPageTransition = 'none';
var router = new Router();
Backbone.emulateHTTP = true;
Backbone.emulateJSON = true;
Backbone.history.start();