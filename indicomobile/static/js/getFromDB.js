function getSpeakers(eventId){

    return $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/speakers",
        dataType: "json",
        async: true
    });

}

function getSpeaker(eventId, speakerId){

    return $.ajax({
        type: "GET",
        url: "/event/" + eventId + "/speaker/" + speakerId,
        dataType: "json",
        async: true,
        success: function(resp){
            speaker = resp;
        }
    });

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

    return $.ajax({
        type: "GET",
        url: "/futureEvents/"+part,
        dataType: "json",
        async: true
    });
}

function getOngoingEvents(part){

    return $.ajax({
        type: "GET",
        url: "/ongoingEvents/"+part,
        dataType: "json",
        async: true
    });
}

function getOngoingContributions(){

    return $.ajax({
        type: "GET",
        url: "/ongoingContributions/",
        dataType: "json",
        async: true
    });
}

function isEventInAgenda(eventId){

    var myAgendaSessionsNumber = myAgenda.getInstance().completeSessions.filter(function(session){
        return session.get('eventId') == eventId;
    }).length;

    var myAgendaContribsNumber = myAgenda.getInstance().contributions.filter(function(contrib){
        return contrib.get('eventId') == eventId;
    }).length;

    var event = myAgenda.getInstance().events.find(function(event){
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