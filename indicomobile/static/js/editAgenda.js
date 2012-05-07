function addContributionToAgenda(eventId, sessionId, contributionId) {

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();
    var myAgendaCompleteSessions = loadAgendaCompleteSessions();
    var myAgendaEvents = loadAgendaEvents();
    var event = getEvent(eventId);
    var session = getSession(eventId, sessionId);
    var contribution = getContribution(eventId, sessionId, contributionId);

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

        var numContributionsInSession = myAgendaContributions.filter(function(contrib){
            return contrib.get('sessionId') == session.get('sessionId');
        }).length;
        console.log(numContributionsInSession + '/' + session.get('numContributions'));
        if (numContributionsInSession == session.get('numContributions')){
            myAgendaCompleteSessions.add({'eventId': eventId, 'sessionId': session.get('sessionId')});
            localStorage.setItem('complete_sessions', JSON.stringify(myAgendaCompleteSessions.toJSON()));
            $('#sessions_' + eventId).remove();
        }

    }

}


function addSessionToAgenda(eventId, sessionId) {

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var myAgendaSessions = loadAgendaSessions();
    var myAgendaContributions = loadAgendaContributions();
    var myAgendaEvents = loadAgendaEvents();
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

}


function removeContributionFromAgenda(eventId, sessionId, contributionId) {

    var myAgendaContributions = loadAgendaContributions();
    var myAgendaCompleteSessions = loadAgendaCompleteSessions();
    var myAgendaSessions = loadAgendaSessions();
    var myAgendaEvents = loadAgendaEvents();
    var event = getEvent(eventId);
    var session = getSession(eventId, sessionId);
    var contribution = getContribution(eventId, sessionId, contributionId);

    console.log('remove')

    myAgendaContributions.remove(
            myAgendaContributions.find(function(contrib){
                return contrib.get('eventId') == eventId &&
                contrib.get('sessionUniqueId') == sessionId &&
                contrib.get('contributionId') == contributionId;
            })
    );

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
        var sessionInAgenda = myAgendaSessions.find(function(agendaSession){
            return agendaSession.get('eventId') == eventId &&
            agendaSession.get('id') == sessionId;
        });
        myAgendaSessions.remove(sessionInAgenda);
    }

    var contribInEvent = myAgendaContributions.find(function(contrib){
        return contrib.get('eventId') == eventId;
    });
    if (!contribInEvent){
        console.log('remove Event')
        var eventInAgenda = myAgendaEvents.find(function(agendaEvent){
            return agendaEvent.get('id') == eventId;
        });
        console.log(eventInAgenda)
        myAgendaEvents.remove(eventInAgenda);
    }

    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
    localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    localStorage.setItem('complete_sessions', JSON.stringify(myAgendaCompleteSessions.toJSON()));
    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));

}


function removeSessionFromAgenda(eventId, sessionId) {

    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();
    var myAgendaEvents = loadAgendaEvents();

    while (myAgendaSessions.find(function(session){
        return session.get('eventId') == eventId &&
        session.get('sessionId') == sessionId;
    })){
        myAgendaSessions.remove(
                myAgendaSessions.find(function(session){
                    return session.get('eventId') == eventId &&
                    session.get('sessionId') == sessionId;
                })
        );
    }

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

}

$('.ui-collapsible-favorite').live('favoritecontrib', function() {

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var eventId = $(this).attr('eventId');
    var sessionId = $(this).attr('sessionId');
    var contributionId = $(this).attr('contribId');

    if (!eventId && !sessionId && !contributionId){
        return;
    }
    if ($(this).attr('data-theme') == 'g'){
        addContributionToAgenda(eventId, sessionId, contributionId);
    }
    else if ($(this).attr('data-theme') == 'c'){
        removeContributionFromAgenda(eventId, sessionId, contributionId);
    }
});

$('#addEventToAgenda').live('click', function(){

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var myAgendaEvents = loadAgendaEvents();
    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();
    var eventId = $(this).attr('eventId');
    var event = getEvent(eventId);

    var eventInAgenda = myAgendaEvents.find(function(event){
        return event.get('id') == eventId;
    });
    if (!eventInAgenda){
        myAgendaEvents.add(event);
    }

    var allContributions = getEventContributions(eventId);
    allContributions.each(function(contrib1){
        var contribInAgenda = myAgendaContributions.find(function(contrib2){
            return contrib2.get('eventId') == eventId &&
            contrib1.get('contributionId') == contrib2.get('contributionId') &&
            contrib1.get('sessionId') == contrib2.get('sessionId') &&
            contrib1.get('dayDate') == contrib2.get('dayDate');
        });
        if (!contribInAgenda){
            myAgendaContributions.add(contrib1);
        }
    });
    var allSessions = getEventSessions(eventId);
    allSessions.each(function(session1){
        var sessionInAgenda = myAgendaSessions.find(function(session2){
            return session2.get('eventId') == eventId &&
            session1.get('sessionId') == session2.get('sessionId') &&
            session1.get('dayDate') == session2.get('dayDate');
        });
        if (!sessionInAgenda){
            myAgendaSessions.add(session1);
        }
    });

    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));
    localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));

    //css changes
    $(this).attr('id','removeEventFromAgenda');
    $(this).parent().attr('data-theme','g');
    $(this).parent().find('[data-theme="c"]').attr('data-theme','g');
    $(this).parent().removeClass('ui-btn-up-c').addClass('ui-btn-up-g');
    $(this).parent().find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-g');
    $(this).parent().removeClass('ui-btn-hover-c').addClass('ui-btn-hover-g');
    $(this).parent().find('.ui-btn-hover-c').removeClass('ui-btn-hover-c').addClass('ui-btn-hover-g');
    $(this).parent().find('.ui-icon-star').removeClass('ui-icon-star').addClass('ui-icon-delete');

});
