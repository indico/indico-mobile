$('#addToAgenda').live('click', function(event) {
    if(!window.localStorage) {
        alert('Your browser is not compatible');
    }
    var myAgenda;
    var conferenceId = $(this).attr('confId');
    var sessionId = $(this).attr('sessionId');
    var date = $(this).attr('day');
    var contribId = $(this).attr('contribId');
    var thisDay = conferenceModel.get('days').find(function(day) {
        return day.get('date') == date;
    });
    var thisSlot = thisDay.get('slots').filter(function(slot) {
        return slot.get('sessionId') == sessionId;
    });
    var thisContrib;
    var newSlot;
    for(slots in thisSlot) {
        if(thisSlot[slots].get('contributions').find(function(contrib) {
            return contrib.get('id') == contribId
        })) {
            newSlot = thisSlot[slots].clone();
            thisContrib = newSlot.get('contributions').find(function(contrib) {
                return contrib.get('id') == contribId
            });
            break;
        }
    }
    if(!localStorage.getItem('agenda')) {
        myAgenda = new Conferences();
        myAgenda.add(conferenceModel);
        newSlot.set('contributions', new Contributions(thisContrib));
        var slots = new Slots();
        newSlot.unset('entries');
        slots.add(newSlot);
        myAgenda.at(0).set('days',new Days({
            date : date,
            slots : slots
        }));

        localStorage.setItem('agenda', JSON.stringify(myAgenda.toJSON()));

        saveAgendaToServer(myAgenda);

    } else {
        myAgenda = loadAgenda();
        var confInAgenda = myAgenda.find(function(conf){
            return conf.get('id')==conferenceId;
        });

        if (confInAgenda){

            var dayInAgenda = confInAgenda.get('days').find(function(day) {
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
                    }
                } else {
                    newSlot.unset('entries');
                    newSlot.set('contributions', new Contributions(thisContrib));
                    dayInAgenda.get('slots').add(newSlot);
                    dayInAgenda.get('slots').comparator = function(slot) {
                        return slot.get('startDate').time;
                    };
                    dayInAgenda.get('slots').sort();
                }
            } else {
                newSlot.unset('entries');
                newSlot.set('contributions', new Contributions(thisContrib));
                confInAgenda.get('days').add({
                    date : date,
                    slots : new Slots(newSlot)
                });
                confInAgenda.get('days').comparator = function(day) {
                    return day.get('date');
                };
                confInAgenda.get('days').sort();
            }
        } else {
            var currConf = conferenceModel.clone();
            newSlot.set('contributions', new Contributions(thisContrib));
            var slots = new Slots();
            newSlot.unset('entries');
            slots.add(newSlot);
            currConf.set('days',new Days({
                date : date,
                slots : slots
            }));

            myAgenda.add(currConf);
        }


        localStorage.setItem('agenda', JSON.stringify(myAgenda.toJSON()));
        saveAgendaToServer(myAgenda);


    }

    //css changes
    $(this).attr('style', 'display:none;');
    $(this).parent().removeClass('ui-body-b').addClass('ui-body-f');
    $(this).parent().parent().attr('data-theme', 'f');
    $(this).parent().parent().attr('data-content-theme', 'f');
    $($($($($(this).parent().parent()[0]).children()[0])).children()[0]).removeClass('ui-btn-up-b').addClass('ui-btn-up-f');
    $($($($($(this).parent().parent()[0]).children()[0])).children()[0]).attr('data-theme', 'f');
    $($(this).parent().children()[$(this).parent().children().length - 1]).attr('style', 'display:block;').removeClass('ui-btn-up-b').addClass('ui-btn-up-f');
    $($(this).parent().children()[$(this).parent().children().length - 1]).attr('data-theme', 'f');

});
