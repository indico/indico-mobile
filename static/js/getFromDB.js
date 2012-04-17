function getDays(eventId){

    var days;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/days",
        dataType: "json",
        async: false,
        success: function(resp){
            days = resp;
        }
    });
    return new Days(days);

};

function getDaySessions(eventId, day){

    var sessions;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/day/" + day + "/sessions",
        dataType: "json",
        async: false,
        success: function(resp){
            sessions = resp;
        }
    });
    return new Slots(sessions);

};

function getSessionContributions(eventId, day, sessionId){

    var contributions;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/day/" + day + "/session/" + sessionId  + "/contribs",
        dataType: "json",
        async: false,
        success: function(resp){
            contributions = resp;
        }
    });
    return new Contributions(contributions);

};

function getEventContributions(eventId){

    var contributions;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/contribs",
        dataType: "json",
        async: false,
        success: function(resp){
            contributions = resp;
        }
    });
    return new Contributions(contributions);

};

function getEventSessions(eventId){

    var sessions;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/sessions",
        dataType: "json",
        async: false,
        success: function(resp){
            sessions = resp;
        }
    });
    return new Slots(sessions);

};

function getDay(eventId, dayDate){

    var day;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/day/" + dayDate,
        dataType: "json",
        async: false,
        success: function(resp){
            day = resp;
        }
    });
    return new Day(day);

};

function getEvent(eventId){

    var event;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId,
        dataType: "json",
        async: false,
        success: function(resp){
            event = resp;
        }
    });
    return new Event(event);

};

function getSession(eventId, dayDate, sessionId){

    var session;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/day/" + dayDate + "/session/" + sessionId,
        dataType: "json",
        async: false,
        success: function(resp){
            session = resp;
        }
    });
    return new Slot(session);

};

function getContribution(eventId, dayDate, sessionId, contributionId){

    var contribution;
    $.ajax({
        type: "GET",
        url: "/event" + eventId + "/day/" + dayDate + "/session/" +
        sessionId + "/contrib/" + contributionId,
        dataType: "json",
        async: false,
        success: function(resp){
            contribution = resp;
        }
    });
    return new Contribution(contribution);

};

function isSessionInAgenda(sessionId, eventId, dayDate){

    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();

    var contribInAgenda = myAgendaContributions.filter(function(contrib){
        return contrib.get('eventId') == eventId &&
        contrib.get('sessionId') == sessionId &&
        contrib.get('dayDate') == dayDate;
    });

    var sessionInAgenda = myAgendaSessions.find(function(session){
        return session.get('sessionId') == sessionId &&
        session.get('eventId') == eventId &&
        session.get('dayDate') == dayDate;
    });

    var session = getSession(eventId, dayDate, sessionId);

    if (contribInAgenda.length == session.get('numContributions') && sessionInAgenda){
        return true;
    }
    else{
        return false;
    }

};

function isEventInAgenda(eventId){

    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();

    var contribInAgenda = myAgendaContributions.filter(function(contrib){
        return contrib.get('eventId') == eventId;
    });

    var sessionsInAgenda = myAgendaSessions.filter(function(session){
        return session.get('eventId') == eventId;
    });

    var event = getEvent(eventId);

    if (contribInAgenda.length == event.get('numContributions') &&
            sessionsInAgenda.length == event.get('numSessions')){
        if (contribInAgenda.length === 0 && sessionsInAgenda.length === 0){
            return false;
        }
        else{
            return true;
        }
    }
    else{
        return false;
    }

};