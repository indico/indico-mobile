function addContributionToAgenda(eventId, dayDate, sessionId, contributionId) {

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();
    var myAgendaDays = loadAgendaDays();
    var myAgendaEvents = loadAgendaEvents();
    var event = getEvent(eventId);
    var day = getDay(eventId, dayDate);
    var session = getSession(eventId, dayDate, sessionId);
    var contribution = getContribution(eventId, dayDate, sessionId, contributionId);

    var contribInAgenda = myAgendaContributions.find(function(contrib){
        return contrib.get('date') == dayDate && contrib.get('eventId') == eventId &&
        contrib.get('sessionId') == sessionId && contrib.get('contributionId') == contributionId;
    });
    if (!contribInAgenda){
        myAgendaContributions.add(contribution);

        var dayInAgenda = myAgendaDays.find(function(day){
            return day.get('date') == dayDate && day.get('eventId') == eventId;
        });
        if (!dayInAgenda){
            myAgendaDays.add(new Day({'date':dayDate, 'eventId':eventId}));
            localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));
        }

        var eventInAgenda = myAgendaEvents.find(function(event){
            return event.get('id') == eventId;
        });
        if (!eventInAgenda){
            myAgendaEvents.add(event);
            localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));
        }

        localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));

        var numberContributionsInDay = myAgendaContributions.filter(function(contrib){
            return contrib.get('eventId') == eventId && contrib.get('dayDate') == dayDate;
        }).length;

        var numberSessionsInDay = myAgendaSessions.filter(function(currentSession){
            return currentSession.get('eventId') == eventId &&
            currentSession.get('dayDate') == dayDate;
        }).length;

        if (numberContributionsInDay == 1 && numberSessionsInDay === 0){
            var breakSession = getDaySessions(eventId, dayDate).filter(function(currentSession){
                return currentSession.get('_type') == 'BreakTimeSchEntry';
            });

            for (var i = 0; i < breakSession.length; i++){
                myAgendaSessions.add(breakSession[i]);
            }
        }

        var sessionInAgenda = myAgendaSessions.find(function(currentSession){
            return currentSession.get('sessionId') == sessionId &&
            currentSession.get('dayDate') == dayDate &&
            currentSession.get('eventId') == eventId;
        });
        if (!sessionInAgenda){
            myAgendaSessions.add(session);
        }

        localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));

        var numberContributionsInSession = myAgendaContributions.filter(function(contrib){
            return contrib.get('sessionId') == sessionId &&
            contrib.get('dayDate') == dayDate &&
            contrib.get('eventId') == eventId;
        }).length;

        var numberContributionsInEvent = myAgendaContributions.filter(function(contrib){
            return contrib.get('eventId') == eventId;
        }).length;

        var numberSessionsInEvent = myAgendaSessions.filter(function(session){
            return session.get('eventId') == eventId;
        }).length;

        if (numberContributionsInSession == session.get('numContributions')){
            $('#li-' + sessionId).find('[data-theme="g"]').data('oldtheme','c').attr('data-oldtheme','c');
            $('#li-' + sessionId).find('[data-oldtheme="c"]').data('oldtheme','g').attr('data-oldtheme','g');
            $($('#li-' + sessionId).find('.ui-icon-star')[0]).trigger('click');
        }
        if (numberContributionsInEvent == event.get('numContributions') &&
            numberSessionsInEvent == event.get('numSessions')){
            $('a[eventid="' + eventId + '"][id="addEventToAgenda"]').trigger('click');
        }
    }

}


function addSessionToAgenda(eventId, dayDate, sessionId) {

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var myAgendaSessions = loadAgendaSessions();
    var myAgendaContributions = loadAgendaContributions();
    var myAgendaDays = loadAgendaDays();
    var myAgendaEvents = loadAgendaEvents();
    var event = getEvent(eventId);
    var day = getDay(eventId, dayDate);
    var session = getSession(eventId, dayDate, sessionId);

    var sessionInAgenda = myAgendaSessions.find(function(currentSession){
        return currentSession.get('sessionId') == sessionId &&
        currentSession.get('dayDate') == dayDate &&
        currentSession.get('eventId') == eventId;
    });
    if (!sessionInAgenda){
        myAgendaSessions.add(session);
    }
    var eventInAgenda = myAgendaEvents.find(function(event){
        return event.get('id') == eventId;
    });
    if (!eventInAgenda){
        myAgendaEvents.add(event);
    }

    var dayInAgenda = myAgendaDays.find(function(day){
        return day.get('date') == dayDate && day.get('eventId') == eventId;
    });
    if (!dayInAgenda){
        myAgendaDays.add(new Day({'date': dayDate, 'eventId': eventId}));
        localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));
    }

    var numberSessionsInDay = myAgendaSessions.filter(function(session){
        return session.get('eventId') == eventId && session.get('dayDate') == dayDate;
    }).length;

    var numberContributionsInDay = myAgendaContributions.filter(function(contrib){
        return contrib.get('eventId') == eventId && contrib.get('dayDate') == dayDate;
    }).length;

    if (numberSessionsInDay == 1 && numberContributionsInDay === 0){
        var breakSession = getDaySessions(eventId, dayDate).filter(function(session){
            return session.get('_type') == 'BreakTimeSchEntry';
        });

        for (var i = 0; i < breakSession.length; i++){
            myAgendaSessions.add(breakSession[i]);
        }
    }

    var allContributions = getSessionContributions(eventId,dayDate,sessionId);
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

    var numberSessionsInEvent = myAgendaSessions.filter(function(session){
        return session.get('eventId') == eventId;
    }).length;

    if (numberSessionsInEvent == event.get('numSessions')){
        $('a[eventid="' + eventId + '"][id="addEventToAgenda"]').trigger('click');
    }

    localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
    localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));
    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));

}


function removeContributionFromAgenda(eventId, dayDate, sessionId, contributionId) {

    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();
    var myAgendaDays = loadAgendaDays();
    var myAgendaEvents = loadAgendaEvents();
    var event = getEvent(eventId);
    var day = getDay(eventId, dayDate);
    var session = getSession(eventId, dayDate, sessionId);
    var contribution = getContribution(eventId, dayDate, sessionId, contributionId);

    var breakSlots = myAgendaSessions.filter(function(slot){
        return slot.get('_type') == 'BreakTimeSchEntry' &&
        slot.get('eventId') == eventId &&
        slot.get('dayDate') == dayDate;
    });
    var numberOfBreaks = breakSlots.length;


    var numberContributionsInEvent = myAgendaContributions.filter(function(contrib){
        return contrib.get('eventId') == eventId;
    }).length;

    if(numberContributionsInEvent == event.get('numContributions')){
        var eventDiv = $('a[eventid="' + eventId + '"][id="removeEventFromAgenda"]');
        eventDiv.attr('id','addEventToAgenda');
        eventDiv.parent().attr('data-theme','c');
        eventDiv.parent().find('[data-theme="g"]').attr('data-theme','c');
        eventDiv.parent().removeClass('ui-btn-up-g').addClass('ui-btn-up-c');
        eventDiv.parent().find('.ui-btn-up-g').removeClass('ui-btn-up-g').addClass('ui-btn-up-c');
        eventDiv.parent().removeClass('ui-btn-hover-g').addClass('ui-btn-hover-c');
        eventDiv.parent().find('.ui-btn-hover-g').removeClass('ui-btn-hover-g').addClass('ui-btn-hover-c');
        eventDiv.parent().find('.ui-icon-delete').removeClass('ui-icon-delete').addClass('ui-icon-star');
        localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));
    }

    var numberContributionsInSession = myAgendaContributions.filter(function(contrib){
        return contrib.get('sessionId') == sessionId &&
        contrib.get('dayDate') == dayDate &&
        contrib.get('eventId') == eventId;
    }).length;

    if(session.get('numContributions') == numberContributionsInSession){
        var sessionDiv = $('#li-' + sessionId);
        sessionDiv.find('[data-theme="g"]').data('theme', 'c').attr('data-theme', 'c');
        sessionDiv.find('[data-oldtheme="c"]').data('oldtheme', 'g').attr('data-oldtheme', 'g');
        sessionDiv.find('.ui-btn-up-g').removeClass('ui-btn-up-g').addClass('ui-btn-up-c');
        sessionDiv.find('.ui-btn-hover-g').removeClass('ui-btn-hover-g').addClass('ui-btn-hover-c');
        sessionDiv.find('.ui-body-g').removeClass('ui-body-g');
        $(sessionDiv.find('.ui-icon-delete')[0]).removeClass('ui-icon-delete').addClass('ui-icon-star');
        $(sessionDiv.find('.ui-favorite-icon-delete')[0]).removeClass('ui-favorite-icon-delete').addClass('ui-favorite-icon-star');
        sessionDiv.find('#removeSessionFromAgenda1').attr('id','addSessionToAgenda');
        sessionDiv.find('#addSessionToAgenda').find('.ui-btn-text').html('Add to my agenda');
        localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    }

    if(numberContributionsInSession == 1){
        myAgendaSessions.remove(
            myAgendaSessions.find(function(session){
                return session.get('eventId') == eventId &&
                session.get('sessionId') == sessionId &&
                session.get('dayDate') == dayDate;
            })
        );
    }

    var numberSessionInDay = myAgendaSessions.filter(function(session){
        return session.get('dayDate') == dayDate &&
        session.get('eventId') == eventId;
    }).length;
    if(numberSessionInDay == numberOfBreaks) {
        myAgendaDays.remove(
                myAgendaDays.find(function(day){
                    return day.get('eventId') == eventId &&
                    day.get('date') == dayDate;
                })
        );
    }

    var numberDayInEvent = myAgendaDays.filter(function(day){
        return day.get('eventId') == eventId;
    }).length;
    if(numberDayInEvent === 0) {
        myAgendaEvents.remove(
                myAgendaEvents.find(function(event){
                    return event.get('id') == eventId;
                })
        );
    }

    myAgendaContributions.remove(myAgendaContributions.find(function(contrib){
        return contrib.get('contributionId') ==contributionId &&
        contrib.get('eventId') == eventId &&
        contrib.get('dayDate') == dayDate &&
        contrib.get('sessionId') == sessionId;
    }));

    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));

}


function removeSessionFromAgenda(eventId, dayDate, sessionId) {

    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();
    var myAgendaDays = loadAgendaDays();
    var myAgendaEvents = loadAgendaEvents();

    var breakSlots = myAgendaSessions.filter(function(slot){
        return slot.get('_type') == 'BreakTimeSchEntry' &&
        slot.get('eventId') == eventId &&
        slot.get('dayDate') == dayDate;
    });
    var numberOfBreaks = breakSlots.length;

    myAgendaSessions.remove(
            myAgendaSessions.find(function(session){
                return session.get('eventId') == eventId &&
                session.get('sessionId') == sessionId &&
                session.get('dayDate') == dayDate;
            })
    );

    while (myAgendaContributions.find(function(contrib){
        return contrib.get('eventId') == eventId &&
        contrib.get('dayDate') == dayDate &&
        contrib.get('sessionId') == sessionId;
    })){
        myAgendaContributions.remove(
                myAgendaContributions.find(function(contrib){
                    return contrib.get('eventId') == eventId &&
                    contrib.get('dayDate') == dayDate &&
                    contrib.get('sessionId') == sessionId;
                })
        );
    }

    var numberSessionInDay = myAgendaSessions.filter(function(session){
        return session.get('dayDate') == dayDate &&
        session.get('eventId') == eventId;
    }).length;
    if(numberSessionInDay == numberOfBreaks) {
        myAgendaDays.remove(
                myAgendaDays.find(function(day){
                    return day.get('eventId') == eventId &&
                    day.get('date') == dayDate;
                })
        );
    }

    var numberDayInEvent = myAgendaDays.filter(function(day){
        return day.get('eventId') == eventId;
    }).length;
    if(numberDayInEvent === 0) {
        myAgendaEvents.remove(
                myAgendaEvents.find(function(event){
                    return event.get('id') == eventId;
                })
        );
    }

    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
    localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));
    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));

}

$('.ui-collapsible-favorite').live('favoritecontrib', function() {

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var eventId = $(this).attr('eventId');
    var dayDate = $(this).attr('day');
    var sessionId = $(this).attr('sessionId');
    var contributionId = $(this).attr('contribId');

    if (!eventId && !dayDate && !sessionId && !contributionId){
        return;
    }
    if ($(this).attr('data-theme') == 'f'){
        addContributionToAgenda(eventId, dayDate, sessionId, contributionId);
    }
    else if ($(this).attr('data-theme') == 'b'){
        removeContributionFromAgenda(eventId, dayDate, sessionId, contributionId);
    }
});

$('.ui-collapsible-favorite').live('favoritesession', function() {

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var eventId = $(this).attr('eventId');
    var dayDate = $(this).attr('day');
    var sessionId = $(this).attr('sessionId');

    if (!eventId && !dayDate && !sessionId){
        return;
    }
    if ($(this).attr('data-theme') == 'g'){
        addSessionToAgenda(eventId, dayDate, sessionId);
    }
    else if ($(this).attr('data-theme') == 'c'){
        removeSessionFromAgenda(eventId, dayDate, sessionId);
    }
});

$('#addEventToAgenda').live('click', function(){

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var myAgendaEvents = loadAgendaEvents();
    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();
    var myAgendaDays = loadAgendaDays();
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
    var allDays = getDays(eventId);
    allDays.each(function(day1){
        var dayInAgenda = myAgendaDays.find(function(day2){
            return day2.get('eventId') == eventId &&
            day1.get('date') == day2.get('date');
        });
        if (!dayInAgenda){
            myAgendaDays.add(day1);
        }
    });

    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));
    localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));
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

$('#removeContributionFromAgenda').live('click', function(event) {

    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();
    var myAgendaDays = loadAgendaDays();
    var myAgendaEvents = loadAgendaEvents();

    var eventId = $(this).attr('eventId');

    var contributionDay = $(this).attr('day');

    var breakSlots = myAgendaSessions.filter(function(slot){
        return slot.get('_type') == 'BreakTimeSchEntry' &&
        slot.get('eventId') == eventId &&
        slot.get('dayDate') == contributionDay;
    });
    var numberOfBreaks = breakSlots.length;
    var sessionId = $(this).attr('sessionId');

    var contributionId = $(this).attr('contribId');

    myAgendaContributions.remove(
            myAgendaContributions.find(function(contrib){
                return contrib.get('eventId') == eventId &&
                contrib.get('sessionId') == sessionId &&
                contrib.get('dayDate') == contributionDay;
            })
    );

    $($(this).parent().parent()[0]).remove();

    var numberContributionsInSession = myAgendaContributions.filter(function(contrib){
        return contrib.get('sessionId') == sessionId &&
        contrib.get('dayDate') == contributionDay &&
        contrib.get('eventId') == eventId;
    }).length;

    if(numberContributionsInSession === 0){
        myAgendaSessions.remove(
                myAgendaSessions.find(function(session){
                    return session.get('eventId') == eventId &&
                    session.get('sessionId') == sessionId &&
                    session.get('dayDate') == contributionDay;
                })
        );
        $('#li-' + sessionId).remove();
    }

    var dayRemoved = false;

    var numberSessionInDay = myAgendaSessions.filter(function(session){
        return session.get('dayDate') == contributionDay &&
        session.get('eventId') == eventId;
    }).length;
    if(numberSessionInDay == numberOfBreaks) {
        myAgendaDays.remove(
                myAgendaDays.find(function(day){
                    return day.get('eventId') == eventId &&
                    day.get('date') == contributionDay;
                })
        );
        dayRemoved = true;
    }

    var eventRemoved = false;

    var numberDayInEvent = myAgendaDays.filter(function(day){
        return day.get('eventId') == eventId;
    }).length;
    if(numberDayInEvent === 0) {
        myAgendaEvents.remove(
                myAgendaEvents.find(function(event){
                    return event.get('id') == eventId;
                })
        );
        eventRemoved = true;
    }

    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
    localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));
    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));


    if (eventRemoved){
        $.mobile.changePage('/agenda');
        $('#agendaHome').trigger('pageinit');
    }
    else if (dayRemoved){
        $('#li-' + eventId + '-' + contributionDay).remove();
        $('#sli-' + eventId + '-' + contributionDay).remove();
        $.mobile.changePage('#alldays');
    }
});


$('#removeEventFromAgenda').live('click', function(){

    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();
    var myAgendaDays = loadAgendaDays();
    var myAgendaEvents = loadAgendaEvents();

    var eventId = $(this).attr('eventId');

    while (myAgendaContributions.find(function(contrib){
        return contrib.get('eventId') == eventId;
    })){
        myAgendaContributions.remove(
                myAgendaContributions.find(function(contrib){
                    return contrib.get('eventId');
                })
        );
    }

    while (myAgendaSessions.find(function(session){
        return session.get('eventId') == eventId;
    })){
        myAgendaSessions.remove(
                myAgendaSessions.find(function(session){
                    return session.get('eventId');
                })
        );
    }

    while (myAgendaDays.find(function(day){
        return day.get('eventId') == eventId;
    })){
        myAgendaDays.remove(
                myAgendaDays.find(function(day){
                    return day.get('eventId');
                })
        );
    }

    myAgendaEvents.remove(
            myAgendaEvents.find(function(event){
                return event.get('id');
            })
    );


    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
    localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));
    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));

    //css changes
    $(this).attr('id','addEventToAgenda');
    $(this).parent().attr('data-theme','c');
    $(this).parent().find('[data-theme="g"]').attr('data-theme','c');
    $(this).parent().removeClass('ui-btn-up-g').addClass('ui-btn-up-c');
    $(this).parent().find('.ui-btn-up-g').removeClass('ui-btn-up-g').addClass('ui-btn-up-c');
    $(this).parent().removeClass('ui-btn-hover-g').addClass('ui-btn-hover-c');
    $(this).parent().find('.ui-btn-hover-g').removeClass('ui-btn-hover-g').addClass('ui-btn-hover-c');
    $(this).parent().find('.ui-icon-delete').removeClass('ui-icon-delete').addClass('ui-icon-star');
});

$('#removeSessionFromAgenda').live('click', function(event) {

    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();
    var myAgendaDays = loadAgendaDays();
    var myAgendaEvents = loadAgendaEvents();

    var eventId = $(this).attr('eventId');
    var sessionDay = $(this).attr('day');
    var breakSlots = myAgendaSessions.filter(function(slot){
        return slot.get('_type') == 'BreakTimeSchEntry' &&
        slot.get('eventId') == eventId &&
        slot.get('dayDate') == sessionDay;
    });
    var numberOfBreaks = breakSlots.length;

    var sessionId = $(this).attr('sessionId');

    myAgendaSessions.remove(
            myAgendaSessions.find(function(session){
                return session.get('eventId') == eventId &&
                session.get('sessionId') == sessionId &&
                session.get('dayDate') == sessionDay;
            })
    );

    while (myAgendaContributions.find(function(contrib){
        return contrib.get('eventId') == eventId &&
        contrib.get('dayDate') == sessionDay &&
        contrib.get('sessionId') == sessionId;
    })){
        myAgendaContributions.remove(
                myAgendaContributions.find(function(contrib){
                    return contrib.get('eventId') == eventId &&
                    contrib.get('dayDate') == sessionDay &&
                    contrib.get('sessionId') == sessionId;
                })
        );
    }

    var dayRemoved = false;
    var numberSessionInDay = myAgendaSessions.filter(function(session){
        return session.get('dayDate') == sessionDay &&
        session.get('eventId') == eventId;
    }).length;
    if(numberSessionInDay == numberOfBreaks) {
        myAgendaDays.remove(
                myAgendaDays.find(function(day){
                    return day.get('eventId') == eventId &&
                    day.get('date') == sessionDay;
                })
        );
        dayRemoved = true;
    }

    var eventRemoved = false;
    var numberDayInEvent = myAgendaDays.filter(function(day){
        return day.get('eventId') == eventId;
    }).length;
    if(numberDayInEvent === 0) {
        myAgendaEvents.remove(
                myAgendaEvents.find(function(event){
                    return event.get('id') == eventId;
                })
        );
        eventRemoved = true;
    }

    localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
    localStorage.setItem('sessions', JSON.stringify(myAgendaSessions.toJSON()));
    localStorage.setItem('days', JSON.stringify(myAgendaDays.toJSON()));
    localStorage.setItem('events', JSON.stringify(myAgendaEvents.toJSON()));

    if (eventRemoved){
        $.mobile.changePage('/agenda');
        $('#agendaHome').trigger('pageinit');
    }
    else{

        $('#li-' + sessionId).remove();

        if(dayRemoved) {
            $('#li-' + eventId + '-' + sessionDay).remove();
            $('#sli-' + eventId + '-' + sessionDay).remove();
            $.mobile.changePage('#alldays');
        }
    }

});