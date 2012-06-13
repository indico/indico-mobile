function addContributionToAgenda(eventId, sessionId, contributionId) {

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var myAgendaContributions = myAgenda.getInstance().contributions;
    var myAgendaSessions = myAgenda.getInstance().sessions;
    var myAgendaCompleteSessions = myAgenda.getInstance().completeSessions;
    var myAgendaEvents = myAgenda.getInstance().events;
    var myAgendaDays = myAgenda.getInstance().days;
    var event = getEvent(eventId);
    var session = getSession(eventId, sessionId);
    var contribution = getContribution(eventId, contributionId);

    console.log(session)

    var contribInAgenda = myAgendaContributions.find(function(contrib){
        return contrib.get('eventId') == eventId &&
        contrib.get('sessionUniqueId') == sessionId && contrib.get('contributionId') == contributionId;
    });
    if (!contribInAgenda){
        myAgendaContributions.add(contribution);

        localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));

        var eventInAgenda = myAgendaEvents.find(function(event){
            return event.get('id') == eventId;
        });
        if (!eventInAgenda){
            myAgendaEvents.add(event);
            localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));
        }

        var sessionInAgenda = myAgendaSessions.find(function(currentSession){
            return currentSession.get('id') == sessionId &&
            currentSession.get('eventId') == eventId;
        });
        if (!sessionInAgenda){
            myAgendaSessions.add(session);
            localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
        }

        var dayInAgenda = myAgendaDays.find(function(day){
            return day.get('date') == contribution.get('dayDate') &&
            day.get('eventId') == eventId;
        });
        if (!dayInAgenda){
            myAgendaDays.add({date: contribution.get('dayDate'), eventId: contribution.get('eventId')});
            localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));
        }

        var numContributionsInSession = myAgendaContributions.filter(function(contrib){
            return contrib.get('sessionId') == session.get('sessionId');
        }).length;
        if (numContributionsInSession == session.get('numContributions')){
            myAgendaCompleteSessions.add({'eventId': eventId, 'sessionId': session.get('sessionId')});
            localStorage.setItem('complete_sessions', JSON.stringify(myAgendaCompleteSessions.toJSON()));
            $('#sessions_'+eventId).remove();
        }
        if (isEventInAgenda(eventId)){
            $('a[href="#event_'+eventId+'"]').find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-b');
            $('a[href="#event_'+eventId+'"]').attr('id', 'removeEventFromAgenda');
        }

    }

}


function addSessionToAgenda(eventId, sessionId) {

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var myAgendaSessions = myAgenda.getInstance().sessions;
    var myAgendaContributions = myAgenda.getInstance().contributions;
    var myAgendaEvents = myAgenda.getInstance().events;
    var myAgendaDays = myAgenda.getInstance().days;
    var event = getEvent(eventId);
    var sessions = getEventSameSessions(eventId, sessionId);

    var eventInAgenda = myAgendaEvents.find(function(event){
        return event.get('id') == eventId;
    });
    if (!eventInAgenda){
        myAgendaEvents.add(event);
    }

    sessions.each(function(session){
        var sessionInAgenda = myAgendaSessions.find(function(agendaSession){
            return agendaSession.get('id') == session.get('id') &&
            agendaSession.get('eventId') == session.get('eventId');
        });
        if (!sessionInAgenda){
            myAgendaSessions.add(session);
        }
        var dayInAgenda = myAgendaDays.find(function(day){
            return day.get('date') == session.get('dayDate') &&
            day.get('eventId') == eventId;
        });
        if (!dayInAgenda){
            myAgendaDays.add({date: session.get('dayDate'), eventId: eventId});
        }
    });

    var allContributions = getSessionContributions(eventId, sessionId);
    allContributions.each(function(contrib1){
        var contribInAgenda = myAgendaContributions.find(function(contrib2){
            return contrib2.get('eventId')==eventId &&
            contrib1.get('contributionId')==contrib2.get('contributionId') &&
            contrib1.get('sessionId')==contrib2.get('sessionId') &&
            contrib1.get('dayDate')==contrib2.get('dayDate');
        });
        if (!contribInAgenda){
            myAgendaContributions.add(contrib1);
        }
    });

    localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));
    localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));

}


function removeContributionFromAgenda(eventId, sessionId, contributionId) {

    var myAgendaContributions = myAgenda.getInstance().contributions;
    var myAgendaCompleteSessions = myAgenda.getInstance().completeSessions;
    var myAgendaSessions = myAgenda.getInstance().sessions;
    var myAgendaEvents = myAgenda.getInstance().events;
    var myAgendaDays = myAgenda.getInstance().days;
    var event = getEvent(eventId);
    var session = getSession(eventId, sessionId);
    var contribution = getContribution(eventId, contributionId);

    myAgendaContributions.remove(
            myAgendaContributions.find(function(contrib){
                return contrib.get('eventId') == eventId &&
                contrib.get('sessionUniqueId') == sessionId &&
                contrib.get('contributionId') == contributionId;
            })
    );

    var dayInAgenda = myAgendaContributions.find(function(contrib){
        return contrib.get('eventId') == eventId &&
        contrib.get('dayDate') == contribution.get('dayDate');
    });

    if (!dayInAgenda){
        myAgendaDays.remove(myAgendaDays.find(function(day){
            return day.get('date') == contribution.get('dayDate') &&
            day.get('eventId') == eventId;
        }));
    }

    var sessionInAgenda = myAgendaCompleteSessions.find(function(agendaSession){
        return agendaSession.get('eventId') == eventId &&
        agendaSession.get('sessionId') == session.get('sessionId');
    });
    myAgendaCompleteSessions.remove(sessionInAgenda);

    var contribInSession = myAgendaContributions.find(function(contrib){
        return contrib.get('eventId') == eventId &&
        contrib.get('sessionUniqueId') == sessionId;
    });
    if (!contribInSession){
        sessionInAgenda = myAgendaSessions.find(function(agendaSession){
            return agendaSession.get('eventId') == eventId &&
            agendaSession.get('id') == sessionId;
        });
        myAgendaSessions.remove(sessionInAgenda);
        $('#sessions_'+eventId+'_agenda').remove();
        $('#session_'+eventId+'_'+session.get('sessionId')+'_agenda').remove();
    }

    var contribInEvent = myAgendaContributions.find(function(contrib){
        return contrib.get('eventId') == eventId;
    });
    if (!contribInEvent){
        var eventInAgenda = myAgendaEvents.find(function(agendaEvent){
            return agendaEvent.get('id') == eventId;
        });
        myAgendaEvents.remove(eventInAgenda);
    }

    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
    localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    localStorage.setItem('complete_sessions', JSON.stringify(myAgendaCompleteSessions.toJSON()));
    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));
    localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));

}


function removeSessionFromAgenda(eventId, sessionId) {

    var myAgendaContributions = myAgenda.getInstance().contributions;
    var myAgendaSessions = myAgenda.getInstance().sessions;
    var myAgendaEvents = myAgenda.getInstance().events;
    var myAgendaDays = myAgenda.getInstance().days;

    while (myAgendaContributions.find(function(contrib){
        return contrib.get('eventId') == eventId &&
        contrib.get('sessionId') == sessionId;
    })){
        myAgendaContributions.remove(
                myAgendaContributions.find(function(contrib){
                    return contrib.get('eventId') == eventId &&
                    contrib.get('sessionId') == sessionId;
                })
        );
    }

    while (myAgendaSessions.find(function(session){
        return session.get('eventId') == eventId &&
        session.get('sessionId') == sessionId;
    })){
        var currentSession = myAgendaSessions.find(function(session){
            return session.get('eventId') == eventId &&
            session.get('sessionId') == sessionId;
        });
        var dayInAgenda = myAgendaContributions.find(function(contrib){
            return contrib.get('eventId') == eventId &&
            contrib.get('dayDate') == currentSession.get('dayDate');
        });

        if (!dayInAgenda){
            console.log('remove day')
            myAgendaDays.remove(myAgendaDays.find(function(day){
                return day.get('eventId') == eventId &&
                day.get('date') == currentSession.get('dayDate');
            }));
        }

        myAgendaSessions.remove(currentSession);
    }

    var eventInAgenda = myAgendaContributions.find(function(contribution){
        return contribution.get('eventId') == eventId;
    });

    if (!eventInAgenda){
        myAgendaEvents.remove(
                myAgendaEvents.find(function(event){
                    return event.get('id') == eventId;
                })
        );
    }

    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
    localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));
    localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));

}

function removeEvent(eventId){
    var myAgendaEvents = myAgenda.getInstance().events;
    var myAgendaContributions = myAgenda.getInstance().contributions;
    var myAgendaSessions = myAgenda.getInstance().sessions;
    var myAgendaCompleteSessions = myAgenda.getInstance().completeSessions;
    var myAgendaDays = myAgenda.getInstance().days;

    var dayInAgenda = myAgendaDays.filter(function(day){
        return day.get('eventId') == eventId;
    });
    for (var i = 0; i < dayInAgenda.length; i++){
        myAgendaDays.remove(dayInAgenda[i]);
    }

    var contribInAgenda = myAgendaContributions.filter(function(contrib){
        return contrib.get('eventId') == eventId;
    });
    for (var i = 0; i < contribInAgenda.length; i++){
        myAgendaContributions.remove(contribInAgenda[i]);
    }

    var sessionInAgenda = myAgendaSessions.filter(function(session){
        return session.get('eventId') == eventId;
    });
    for (i = 0; i < sessionInAgenda.length; i++){
        myAgendaSessions.remove(sessionInAgenda[i]);
    }

    sessionInAgenda = myAgendaCompleteSessions.filter(function(session){
        return session.get('eventId') == eventId;
    });
    for (i = 0; i < sessionInAgenda.length; i++){
        myAgendaCompleteSessions.remove(sessionInAgenda[i]);
    }

    var eventInAgenda = myAgendaEvents.filter(function(event){
        return event.get('id') == eventId;
    });
    for (i = 0; i < eventInAgenda.length; i++){
        myAgendaEvents.remove(eventInAgenda[i]);
    }

    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));
    localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    localStorage.setItem('complete_sessions', JSON.stringify(myAgendaCompleteSessions.toJSON()));
    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
    localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));
}

$('#addEventToAgenda').live('click', function(){

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    removeEvent($(this).attr('eventId'));
    var myAgendaEvents = myAgenda.getInstance().events;
    var myAgendaContributions = myAgenda.getInstance().contributions;
    var myAgendaSessions = myAgenda.getInstance().sessions;
    var myAgendaCompleteSessions = myAgenda.getInstance().completeSessions;
    var myAgendaDays = myAgenda.getInstance().days;
    var eventId = $(this).attr('eventId');
    var event = getEvent(eventId);

    removeEvent($(this).attr('eventId'));

    myAgendaEvents.add(event);


    var allContributions = getEventContributions(eventId);
    console.log(allContributions)
    for (var i = 0; i < allContributions.size(); i++){
        console.log(allContributions.at(i))
        myAgendaContributions.add(allContributions.at(i));
    }

    var allSessions = getEventSessions(eventId);

    allSessions.each(function(session1){
        var completeSessionInAgenda = myAgendaCompleteSessions.find(function(session2){
            return session2.get('eventId') == eventId &&
            session1.get('sessionId') == session2.get('sessionId');
        });
        myAgendaSessions.add(session1);
        if (!completeSessionInAgenda){
            myAgendaCompleteSessions.add({'eventId': eventId, 'sessionId': session1.get('sessionId')});
        }
    });

    var allDays = getEventDays(eventId);
    console.log(allDays)

    allDays.each(function(day1){
        console.log(day1.get('date'))
        var dayInAgenda = myAgendaDays.find(function(day2){
            return day1.get('eventId') == day2.get('eventId') &&
            day1.get('date') == day2.get('date');
        });
        if (!dayInAgenda){
            myAgendaDays.add(day1);
        }
    });

    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));
    localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    localStorage.setItem('complete_sessions', JSON.stringify(myAgendaCompleteSessions.toJSON()));
    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
    localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));

    //css changes
    $(this).attr('id','removeEventFromAgenda');
    $(this).find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-b');

});

$('#removeEventFromAgenda').live('click', function(){

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    removeEvent($(this).attr('eventId'));

    //css changes
    $(this).attr('id','addEventToAgenda');
    $(this).find('.ui-btn-up-b').removeClass('ui-btn-up-b').addClass('ui-btn-up-c');

});

$('#removeEvent').live('click', function(){

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    removeEvent($(this).attr('eventId'));

    var prevElement = $(this).closest('li').prev();
    var nextElement = $(this).closest('li').next();

    if (prevElement.attr('data-role') == 'list-divider'){
        if (nextElement.length === 0 || nextElement.attr('data-role') == 'list-divider'){
            prevElement.remove();
        }
    }
    console.log($(this).closest('ul').find('li').length);
    if ($(this).closest('ul').find('li').length == 1){
        $('#agendaEventList').append('<h4>There is nothing in your agenda</h4>');
    }
    $(this).closest('li').remove();


});
