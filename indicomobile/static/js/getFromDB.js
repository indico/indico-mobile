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
    console.log(speakers.length)
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

function getEventDays(eventId){

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
    console.log(event)
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

function getContribution(eventId, contributionId){

    var contribution;
    $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/contrib/" + contributionId,
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

function getOngoingEvents(part){

    var ongoingEvents;
    $.ajax({
        type: "GET",
        url: "/ongoingEvents/"+part,
        dataType: "json",
        async: false,
        success: function(resp){
            ongoingEvents = resp;
        }
    });
    return ongoingEvents;
}

function getOngoingContributions(){

    var ongoingContribs;
    $.ajax({
        type: "GET",
        url: "/ongoingContributions/",
        dataType: "json",
        async: false,
        success: function(resp){
            ongoingContribs = resp;
        }
    });
    return ongoingContribs;
}

function isEventInAgenda(eventId){

    var myAgendaSessionsNumber = loadAgendaCompleteSessions().filter(function(session){
        return session.get('eventId') == eventId;
    }).length;

    var myAgendaContribsNumber = loadAgendaContributions().filter(function(contrib){
        return contrib.get('eventId') == eventId;
    }).length;

    var event = loadAgendaEvents().find(function(event){
        return event.get('id') == eventId;
    });
    if (event){
    console.log(myAgendaSessionsNumber)
    console.log(event.get('numSessions'))
    console.log(myAgendaContribsNumber)
    console.log(event.get('numContributions'))
    }
    if (event && myAgendaSessionsNumber == event.get('numSessions') &&
         myAgendaContribsNumber == event.get('numContributions') && event.get('numContributions') !== 0){
        return true;
    }
    else if (event && event.get('type') == 'simple_event'){
        return true;
    }
    else{
        return false;
    }

}