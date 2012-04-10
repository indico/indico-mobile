$('#addContributionToAgenda').live('click', function(event) {
    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var myAgenda;
    var eventId = $(this).attr('eventId');
    var sessionId = $(this).attr('sessionId');
    var date = $(this).attr('day');
    var contribId = $(this).attr('contribId');

    var thisDay = currentEvent.get('days').find(function(day) {
        return day.get('date') == date;
    });
    var thisSlot = thisDay.get('slots').filter(function(slot) {
        return slot.get('sessionId') == sessionId;
    });
    var thisContrib;
    var newSlot;
    var allContributions = false;
    var slotNumber;
    for(slots in thisSlot) {
        if(thisSlot[slots].get('contributions').find(function(contrib) {
            return contrib.get('id') == contribId
        })) {
            newSlot = thisSlot[slots].clone();
            slotNumber = slots;
            thisContrib = newSlot.get('contributions').find(function(contrib) {
                return contrib.get('id') == contribId
            });
            break;
        }
    }

    if(!localStorage.getItem('agenda')) {

        myAgenda = new Events();
        myAgenda.add(currentEvent);
        newSlot.set('contributions', new Contributions(thisContrib));
        var slots = new Slots();
        newSlot.unset('entries');
        slots.add(newSlot);
        var breakSlots = thisDay.get('slots').filter(function(slot){
            return slot.get('_type') == 'BreakTimeSchEntry';
        });
        if(breakSlots){
            slots.add(breakSlots);
        }

        slots.comparator = function(slot){
            return slot.get('startDate').time;
        }
        slots.sort();
        myAgenda.at(0).set('days',new Days({
            date : date,
            slots : slots
        }));
        if (thisSlot[slotNumber].get('contributions').size()==newSlot.get('contributions').size()){
            allContributions = true;
        }

        localStorage.setItem('agenda', JSON.stringify(myAgenda.toJSON()));

        saveAgendaToServer(myAgenda);

    } else {

        myAgenda = loadAgenda();
        var eventInAgenda = myAgenda.find(function(event){
            return event.get('id')==eventId;
        });

        if (eventInAgenda){

            var dayInAgenda = eventInAgenda.get('days').find(function(day) {
                return day.get('date') == date;
            });

            if(dayInAgenda) {
                var slotInAgenda = dayInAgenda.get('slots').find(function(slot) {
                    return slot.get('id') == newSlot.get('id');
                });
                if(slotInAgenda) {
                    if(slotInAgenda.get('contributions').find(function(contrib) {
                        return contrib.get('id') == contribId;
                    })) {
                    } else {
                        slotInAgenda.get('contributions').add(thisContrib);
                        slotInAgenda.get('contributions').comparator = function(contrib) {
                            return contrib.get('startDate').time;
                        };
                        slotInAgenda.get('contributions').sort();
                        if (thisSlot[slotNumber].get('contributions').size()==slotInAgenda.get('contributions').size()){
                            allContributions = true;
                        }
                    }
                } else {
                    newSlot.unset('entries');
                    newSlot.set('contributions', new Contributions(thisContrib));
                    dayInAgenda.get('slots').add(newSlot);
                    dayInAgenda.get('slots').comparator = function(slot) {
                        return slot.get('startDate').time;
                    };
                    dayInAgenda.get('slots').sort();

                    if (thisSlot[slotNumber].get('contributions').size()==newSlot.get('contributions').size()){
                        allContributions = true;
                    }
                }
            } else {
                var slots = newSlots();
                newSlot.unset('entries');
                newSlot.set('contributions', new Contributions(thisContrib));
                slots.add(newSlot);
                var breakSlots = thisDay.get('slots').filter(function(slot){
                    return slot.get('_type') == 'BreakTimeSchEntry';
                });

                if(breakSlots){
                    slots.add(breakSlots);
                }
                slots.comparator = function(slot){
                    return slot.get('startDate').time;
                }
                slots.sort();
                eventInAgenda.get('days').add({
                    date : date,
                    slots : new Slots(newSlot)
                });

                eventInAgenda.get('days').comparator = function(day) {
                    return day.get('date');
                };
                eventInAgenda.get('days').sort();
                if (thisSlot[slotNumber].get('contributions').size()==newSlot.get('contributions').size()){
                    allContributions = true;
                }
            }
        } else {
            var currEvent = currentEvent.clone();
            newSlot.set('contributions', new Contributions(thisContrib));
            var slots = new Slots();
            newSlot.unset('entries');
            slots.add(newSlot);

            var breakSlots = thisDay.get('slots').filter(function(slot){
                return slot.get('_type') == 'BreakTimeSchEntry';
            });

            if(breakSlots){
                slots.add(breakSlots);
            }
            slots.comparator = function(slot){
                return slot.get('startDate').time;
            }
            slots.sort();
            currEvent.set('days',new Days({
                date : date,
                slots : slots
            }));
            if (thisSlot[slotNumber].get('contributions').size()==newSlot.get('contributions').size()){
                allContributions = true;
            }

            myAgenda.add(currEvent);
        }


        localStorage.setItem('agenda', JSON.stringify(myAgenda.toJSON()));
        saveAgendaToServer(myAgenda);


    }

    //css changes
    if (allContributions){
        $('#li-'+thisSlot[slotNumber].get('id')).find('#addSessionToAgenda').trigger('click');
    }
    else{
        var contribution = $(this).parent().parent();
        contribution.find('[data-theme="b"]').attr('data-theme','f');
        contribution.find('[data-content-theme="b"]').attr('data-content-theme','f');
        contribution.find('.ui-btn-up-b').removeClass('ui-btn-up-b').addClass('ui-btn-up-f');
        contribution.find('.ui-body-b').removeClass('ui-body-b').addClass('ui-body-f');
        contribution.find('#addContributionToAgenda').attr('style','display:none;');
        contribution.find('#removeContributionFromAgenda1').attr('style','display:block;');
    }


});

$('#addEventToAgenda').live('click', function(){

    myAgenda = loadAgenda();
    var eventId = $(this).attr('eventId');
    var eventModel = initEvent(eventId);
    if (myAgenda!=null){
        console.log(myAgenda);
        var eventInAgenda = myAgenda.find(function(event){
            return event.get('id')==eventId;
        });
        if (eventInAgenda){
            console.log('already in');
            myAgenda.remove(eventInAgenda);
            myAgenda.add(eventModel);
        }
        else{
            myAgenda.add(eventModel);
        }
    }
    else{
        myAgenda = new Events();
        myAgenda.add(eventModel);
    }
    localStorage.setItem('agenda', JSON.stringify(myAgenda.toJSON()));

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

$('#addSessionToAgenda').live('click', function(event) {

    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }

    var myAgenda;
    var eventId = $(this).attr('eventId');
    var sessionId = $(this).attr('sessionId');
    var date = $(this).attr('day');
    var thisDay = currentEvent.get('days').find(function(day) {
        return day.get('date') == date;
    });

    var thisSlot = thisDay.get('slots').filter(function(slot) {
        return slot.get('id') == sessionId;
    });
    var allContributions = false;
    if(!localStorage.getItem('agenda')) {
        myAgenda = new Events();
        myAgenda.add(currentEvent);
        var slots = new Slots();
        slots.add(thisSlot);
        var breakSlots = thisDay.get('slots').filter(function(slot){
            return slot.get('_type') == 'BreakTimeSchEntry';
        });

        if(breakSlots){
            slots.add(breakSlots);
        }
        slots.comparator = function(slot){
            return slot.get('startDate').time;
        }
        slots.sort();
        myAgenda.at(0).set('days',new Days({
            date : date,
            slots : slots
        }));

        localStorage.setItem('agenda', JSON.stringify(myAgenda.toJSON()));

        saveAgendaToServer(myAgenda);

    } else {
        myAgenda = loadAgenda();
        var eventInAgenda = myAgenda.find(function(event){
            return event.get('id')==eventId;
        });

        if (eventInAgenda){

            var dayInAgenda = eventInAgenda.get('days').find(function(day) {
                return day.get('date') == date;
            });

            if(dayInAgenda) {
                var slotInAgenda = dayInAgenda.get('slots').find(function(slot){
                   return slot.get('id') == sessionId;
                });
                if(slotInAgenda){
                    dayInAgenda.get('slots').remove(slotInAgenda);
                }
                dayInAgenda.get('slots').add(thisSlot);
            } else {
                var slots = new Slots(thisSlot);
                var breakSlots = thisDay.get('slots').filter(function(slot){
                    return slot.get('_type') == 'BreakTimeSchEntry';
                });

                if(breakSlots){
                    slots.add(breakSlots);
                }
                slots.comparator = function(slot){
                    return slot.get('startDate').time;
                }
                slots.sort();
                var currDay = new Day({date:date, slots: slots});
                eventInAgenda.get('days').add(currDay);
            }
        } else {
            var currEvent = currentEvent.clone();
            var slots = new Slots(thisSlot);
            var breakSlots = thisDay.get('slots').filter(function(slot){
                return slot.get('_type') == 'BreakTimeSchEntry';
            });

            if(breakSlots){
                slots.add(breakSlots);
            }
            slots.comparator = function(slot){
                return slot.get('startDate').time;
            }
            slots.sort();
            currEvent.set('days',new Days({
                date : date,
                slots : slots
            }));

            console.log(currEvent);

            myAgenda.add(currEvent);
        }


        localStorage.setItem('agenda', JSON.stringify(myAgenda.toJSON()));
        saveAgendaToServer(myAgenda);
    }

    //css changes
    var session = $('#li-'+sessionId);
    session.find('[data-theme="b"]').attr('data-theme','f');
    session.find('[data-content-theme="b"]').attr('data-content-theme','f');
    session.find('[data-theme="c"]').attr('data-theme','g');
    session.find('[data-content-theme="c"]').attr('data-content-theme','g');
    session.find('.ui-btn-up-b').removeClass('ui-btn-up-b').addClass('ui-btn-up-f');
    session.find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-g');
    session.find('.ui-body-b').removeClass('ui-body-b').addClass('ui-body-f');
    session.find('.ui-body-c').removeClass('ui-body-c').addClass('ui-body-g');
    session.find('#addContributionToAgenda').attr('style','display:none;');
    session.find('#addSessionToAgenda').attr('style','display:none;');
    session.find('#removeContributionFromAgenda1').attr('style','display:block;');
    session.find('#removeSessionFromAgenda1').attr('style','display:block;');


});

$('#removeContributionFromAgenda').live('click', function(event) {

    var myAgenda = loadAgenda();

    var eventId = $(this).attr('eventId');
    thisEvent = myAgenda.find(function(event){
        return event.get('id') == eventId;
    });

    var contributionDay = $(this).attr('day');
    thisDay = thisEvent.get('days').find(function(day) {
        return day.get('date') == contributionDay;
    });

    var breakSlots = thisDay.get('slots').filter(function(slot){
        return slot.get('_type') == 'BreakTimeSchEntry';
    });
    var numberOfBreaks = breakSlots.length;
    var sessionId = $(this).attr('sessionId');
    thisSlot = thisDay.get('slots').filter(function(slot) {
        return slot.get('sessionId') == sessionId;
    });

    var thisContrib;
    var contributionId = $(this).attr('contribId');
    var sessionRemoved = false;
    for(slot in thisSlot) {
        if(thisSlot[slot].get('contributions').find(function(contrib) {
            return contrib.get('id') == contributionId;
        })) {
            slotId = thisSlot[slot].get('id');
            thisSlot[slot].get('contributions').remove(thisSlot[slot].get('contributions').find(function(contrib) {
                return contrib.get('id') == contributionId;
            }));
            $($(this).parent().parent()[0]).remove();
            if(thisSlot[slot].get('contributions').size() == 0) {
                thisDay.get('slots').remove(thisSlot[slot]);
                $($(this).parent().parent()[0]).remove();
                $('#li-' + slotId).remove();
            }
        }

    }

    var dayRemoved = false;
    console.log(thisDay.get('slots').size());
    console.log(numberOfBreaks);
    if(thisDay.get('slots').size() == numberOfBreaks) {
        eventDay = currentEvent.get('days').find(function(day){
            return day.get('date')==contributionDay;
        });
        currentEvent.get('days').remove(eventDay);
        thisEvent.get('days').remove(thisDay);
        dayRemoved = true;
    }

    var eventRemoved = false;
    if(thisEvent.get('days').size() == 0) {
        myAgenda.remove(thisEvent);
        eventRemoved = true;
    }

    localStorage.setItem('agenda', JSON.stringify(myAgenda.toJSON()));
    $.ajax({
            type : "POST",
            url : "/save",
            dataType : "json",
            data : {
                agenda:JSON.stringify(myAgenda.toJSON())
            }
        });


    if (eventRemoved){
        $.mobile.changePage('/agenda');
        $(document).trigger('pageinit');
    }
    else if (dayRemoved){
        $('#li-'+contributionDay).remove();
        $('#sli-'+contributionDay).remove();
        $.mobile.changePage('#alldays');
    }
});

$('#removeContributionFromAgenda1').live('click', function(event) {

    var myAgenda = loadAgenda();

    var eventId = $(this).attr('eventId');
    thisEvent = myAgenda.find(function(event){
        return event.get('id') == eventId;
    });

    var contributionDay = $(this).attr('day');
    thisDay = thisEvent.get('days').find(function(day) {
        return day.get('date') == contributionDay;
    });
    var breakSlots = thisDay.get('slots').filter(function(slot){
        return slot.get('_type') == 'BreakTimeSchEntry';
    });
    var numberOfBreaks = breakSlots.length;

    thisCurrentDay = currentEvent.get('days').find(function(day) {
        return day.get('date') == contributionDay;
    });

    var sessionId = $(this).attr('sessionId');
    thisSlot = thisDay.get('slots').filter(function(slot) {
        return slot.get('sessionId') == sessionId;
    });

    thisCurrentSlot = thisCurrentDay.get('slots').filter(function(slot) {
        return slot.get('sessionId') == sessionId;
    });

    var thisContrib;
    var contributionId = $(this).attr('contribId');
    var thisCurrentSlotSize;
    for (slot in thisCurrentSlot){
        if(thisCurrentSlot[slot].get('contributions').find(function(contrib) {
            return contrib.get('id') == contributionId;
        })) {
            thisCurrentSlotSize = thisCurrentSlot[slot].get('contributions').size();
        }
    }
    var wasComplete=false;
    for(slot in thisSlot) {
        if(thisSlot[slot].get('contributions').find(function(contrib) {
            return contrib.get('id') == contributionId;
        })) {
            slotId = thisSlot[slot].get('id');
            if(thisSlot[slot].get('contributions').size()==thisCurrentSlotSize){
                wasComplete=true;
            }
            thisSlot[slot].get('contributions').remove(thisSlot[slot].get('contributions').find(function(contrib) {
                return contrib.get('id') == contributionId;
            }));
            if(thisSlot[slot].get('contributions').size() == 0) {
                thisDay.get('slots').remove(thisSlot[slot]);
            }
        }

    }
    console.log(thisDay.get('slots').size());
    console.log(numberOfBreaks);
    if(thisDay.get('slots').size() == numberOfBreaks) {
        thisEvent.get('days').remove(thisDay);
    }
    if(thisEvent.get('days').size() == 0) {
        myAgenda.remove(thisEvent);
    }


    localStorage.setItem('agenda', JSON.stringify(myAgenda.toJSON()));
    $.ajax({
            type : "POST",
            url : "/save",
            dataType : "json",
            data : {
                agenda:JSON.stringify(myAgenda.toJSON())
            }
        });


    var contribution = $(this).parent().parent();
    contribution.find('[data-theme="f"]').attr('data-theme','b');
    contribution.find('[data-content-theme="f"]').attr('data-content-theme','b');
    contribution.find('.ui-btn-up-f').removeClass('ui-btn-up-f').addClass('ui-btn-up-b');
    contribution.find('.ui-body-f').removeClass('ui-body-f').addClass('ui-body-b');
    contribution.find('#addContributionToAgenda').attr('style','display:block;');
    contribution.find('#removeContributionFromAgenda1').attr('style','display:none;');
    if(wasComplete){
        var session = contribution.parent().parent().parent();
        session.find('[data-theme="g"]').attr('data-theme', 'c');
        session.find('[data-content-theme="g"]').attr('data-content-theme', 'c');
        session.find('.ui-btn-up-g').removeClass('ui-btn-up-g').addClass('ui-btn-up-c');
        session.find('.ui-btn-hover-g').removeClass('ui-btn-hover-g').addClass('ui-btn-hover-c');
        session.find('.ui-body-g').removeClass('ui-body-g');
        session.find('#removeSessionFromAgenda1').attr('style','display:none;');
        session.find('#addSessionToAgenda').attr('style','display:block;');

    }
});


$('#removeEventFromAgenda').live('click', function(){
    var myAgenda = loadAgenda();
    var eventModel = initEvent($(this).attr('eventId'));
    myAgenda.remove(eventModel);
    localStorage.setItem('agenda', JSON.stringify(myAgenda.toJSON()));

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

    var myAgenda = loadAgenda();

    var eventId = $(this).attr('eventId');
    thisEvent = myAgenda.find(function(event){
        return event.get('id') == eventId;
    });

    var sessionDay = $(this).attr('day');
    thisDay = thisEvent.get('days').find(function(day) {
        return day.get('date') == sessionDay;
    });
    var breakSlots = thisDay.get('slots').filter(function(slot){
        return slot.get('_type') == 'BreakTimeSchEntry';
    });
    var numberOfBreaks = breakSlots.length;

    var sessionId = $(this).attr('sessionId');
    thisSlot = thisDay.get('slots').filter(function(slot) {
        return slot.get('id') == sessionId;
    });

    thisDay.get('slots').remove(thisSlot);

    var dayRemoved = false;
    if(thisDay.get('slots').size() == numberOfBreaks) {
        eventDay = currentEvent.get('days').find(function(day){
            return day.get('date')==sessionDay;
        });
        currentEvent.get('days').remove(eventDay);
        thisEvent.get('days').remove(thisDay);
        dayRemoved = true;
    }

    var eventRemoved = false;
    if(thisEvent.get('days').size() == 0) {
        myAgenda.remove(thisEvent);
        eventRemoved = true;
    }

    localStorage.setItem('agenda', JSON.stringify(myAgenda.toJSON()));
    $.ajax({
            type : "POST",
            url : "/save",
            dataType : "json",
            data : {
                agenda:JSON.stringify(myAgenda.toJSON())
            }
        });



    if (eventRemoved){
        $(document).trigger('pageinit');
        $.mobile.changePage('/agenda');
    }
    else{

        $('#li-' + sessionId).remove();

        if(dayRemoved) {
            $('#li-'+sessionDay).remove();
            $('#sli-'+sessionDay).remove();
            $.mobile.changePage('#alldays');
        }
    }

});
$('#removeSessionFromAgenda1').live('click', function(event) {

    var myAgenda = loadAgenda();

    var eventId = $(this).attr('eventId');
    thisEvent = myAgenda.find(function(event){
        return event.get('id') == eventId;
    });

    var sessionDay = $(this).attr('day');
    thisDay = thisEvent.get('days').find(function(day) {
        return day.get('date') == sessionDay;
    });
    var breakSlots = thisDay.get('slots').filter(function(slot){
        return slot.get('_type') == 'BreakTimeSchEntry';
    });
    var numberOfBreaks = breakSlots.length;

    var sessionId = $(this).attr('sessionId');
    thisSlot = thisDay.get('slots').filter(function(slot) {
        return slot.get('id') == sessionId;
    });

    thisDay.get('slots').remove(thisSlot);

    if(thisDay.get('slots').size() == numberOfBreaks) {
        thisEvent.get('days').remove(thisDay);
    }
    if(thisEvent.get('days').size() == 0) {
        myAgenda.remove(thisEvent);
    }


    localStorage.setItem('agenda', JSON.stringify(myAgenda.toJSON()));
    $.ajax({
            type : "POST",
            url : "/save",
            dataType : "json",
            data : {
                agenda:JSON.stringify(myAgenda.toJSON())
            }
        });

  //css changes
    var session = $('#li-'+sessionId);
    session.find('[data-theme="f"]').attr('data-theme','b');
    session.find('[data-content-theme="f"]').attr('data-content-theme','b');
    session.find('[data-theme="g"]').attr('data-theme','c');
    session.find('[data-content-theme="g"]').attr('data-content-theme','c');
    session.find('.ui-btn-up-f').removeClass('ui-btn-up-f').addClass('ui-btn-up-b');
    session.find('.ui-body-f').removeClass('ui-body-f').addClass('ui-body-b');
    session.find('.ui-btn-up-g').removeClass('ui-btn-up-g').addClass('ui-btn-up-c');
    session.find('.ui-body-g').removeClass('ui-body-g');
    session.find('#addContributionToAgenda').attr('style','display:block;');
    session.find('#removeContributionFromAgenda1').attr('style','display:none;');
    session.find('#removeSessionFromAgenda1').attr('style','display:none;');
    session.find('#addSessionToAgenda').attr('style','display:block;');
});