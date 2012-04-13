getDays = function(eventId){
    var days;
    $.ajax({
        type : "GET",
        url : "/eventDays",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId,
        },
        success: function(resp){
            days=resp;
        }
    });
    console.log(days)
    return new Days(days);

};

getDaySessions = function(eventId, day){
    var sessions;
    $.ajax({
        type : "GET",
        url : "/daySessions",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId,
            day: day
        },
        success: function(resp){
            sessions=resp;
        }
    });
    return new Slots(sessions);
};

getSessionContributions = function(eventId, day, sessionId){
    var contributions;
    $.ajax({
        type : "GET",
        url : "/sessionContributions",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId,
            day: day,
            sessionId: sessionId
        },
        success: function(resp){
            contributions=resp;
        }
    });
    return new Contributions(contributions);

};

getEventContributions = function(eventId){
    var contributions;
    $.ajax({
        type : "GET",
        url : "/eventContributions",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId
        },
        success: function(resp){
            contributions=resp;
        }
    });
    return new Contributions(contributions);

};

getEventSessions = function(eventId){
    var sessions;
    $.ajax({
        type : "GET",
        url : "/eventSessions",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId
        },
        success: function(resp){
            sessions=resp;
        }
    });
    return new Slots(sessions);

};

getDay = function(eventId, dayDate){
    var day;
    $.ajax({
        type : "GET",
        url : "/eventDay",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId,
            dayDate: dayDate
        },
        success: function(resp){
            day=resp;
        }
    });
    return new Day(day);

}

getEvent = function(eventId){
    console.log(eventId)
    var event;
    $.ajax({
        type : "GET",
        url : "/eventInfo",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId,
        },
        success: function(resp){
            event=resp;
        }
    });
    return new Event(event);

}

getSession = function(eventId, dayDate, sessionId){
    var session;
    $.ajax({
        type : "GET",
        url : "/eventSession",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId,
            dayDate: dayDate,
            sessionId: sessionId
        },
        success: function(resp){
            session=resp;
        }
    });
    return new Slot(session);

}

getContribution = function(eventId, dayDate, sessionId, contributionId){
    var contribution;
    $.ajax({
        type : "GET",
        url : "/eventContribution",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId,
            dayDate: dayDate,
            sessionId: sessionId,
            contributionId: contributionId
        },
        success: function(resp){
            contribution=resp;
        }
    });
    return new Contribution(contribution);

}

isSessionInAgenda = function(sessionId, eventId, dayDate){
    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();

    var contribInAgenda = myAgendaContributions.filter(function(contrib){
        return contrib.get('eventId')==eventId && contrib.get('sessionId')==sessionId && contrib.get('dayDate') == dayDate;
    });

    var sessionInAgenda = myAgendaSessions.find(function(session){
        return session.get('sessionId')==sessionId && session.get('eventId')==eventId && session.get('dayDate')==dayDate;
    });

    var session = getSession(eventId, dayDate, sessionId);

    if (contribInAgenda.length == session.get('numContributions') && sessionInAgenda){
        return true;
    }
    else{
        return false;
    }
};

isEventInAgenda = function(eventId){
    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();

    var contribInAgenda = myAgendaContributions.filter(function(contrib){
        return contrib.get('eventId')==eventId;
    });

    var sessionsInAgenda = myAgendaSessions.filter(function(session){
        return session.get('eventId')==eventId;
    });

    var event = getEvent(eventId);

    if (contribInAgenda.length == event.get('numContributions') &&
            sessionsInAgenda.length == event.get('numSessions')){
        if (contribInAgenda.length == 0 && sessionsInAgenda.length==0){
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