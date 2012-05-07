function getSpeakers(eventId){

    var speakers;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/speakers",
        dataType: "json",
        async: false,
        success: function(resp){
            speakers = resp;
        }
    });
    return new Speakers(speakers);

}

function getSpeaker(eventId, speakerId){

    var speaker;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/speaker/" + speakerId,
        dataType: "json",
        async: false,
        success: function(resp){
            speaker = resp;
        }
    });
    return new Speaker(speaker);

}

function getSpeakerContributions(eventId, speakerId){

    var contribs;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/speaker/" + speakerId + "/contributions",
        dataType: "json",
        async: false,
        success: function(resp){
            contribs = resp;
        }
    });
    return new Contributions(contribs);

}

function getDayContributions(eventId, day){

    var contribs;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/day/" + day + "/contributions",
        dataType: "json",
        async: false,
        success: function(resp){
            contribs = resp;
        }
    });
    return new Contributions(contribs);

}

function getSessionContributions(eventId, sessionId){

    var contributions;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/session/" + sessionId  + "/contribs",
        dataType: "json",
        async: false,
        success: function(resp){
            contributions = new Contributions(resp);

        }
    });
    return contributions;

}

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

}

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

}

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

}

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

}

function getSession(eventId, sessionId){

    var session;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/session/" + sessionId,
        dataType: "json",
        async: false,
        success: function(resp){
            session = resp;
        }
    });
    return new Slot(session);

}


function getEventSameSessions(eventId, sessionId){

    var sessions;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/sessions/" + sessionId,
        dataType: "json",
        async: false,
        success: function(resp){
            sessions = resp;
        }
    });
    return new Slots(sessions);

}

function getContribution(eventId, sessionId, contributionId){

    var contribution;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/session/" +
        sessionId + "/contrib/" + contributionId,
        dataType: "json",
        async: false,
        success: function(resp){
            contribution = resp;
        }
    });
    return new Contribution(contribution);

}

function getFutureEvents(part){

    var futureEvents;
    $.ajax({
        type: "GET",
        url: "/futureEvents/"+part,
        dataType: "json",
        async: false,
        success: function(resp){
            futureEvents = resp;
        }
    });
    return futureEvents;
}

function isEventInAgenda(eventId){

    var myAgendaSessionsNumber = loadAgendaCompleteSessions().filter(function(session){
        return session.get('eventId') == eventId;
    }).length;

    var event = getEvent(eventId);

    if (myAgendaSessionsNumber == event.get('numSessions') && event.get('numSessions') !== 0){
        return true;
    }
    else{
        return false;
    }

}