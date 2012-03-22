var sessionRemoved=false,
myAgenda, confId, sessionId, slotId, date, contribId, thisConf, thisDay, thisSlot, thisContrib;
removeFromAgenda = function(conferenceId, sessId, contribDate, contribId){
    myAgenda = loadAgenda();
    confId = conferenceId;
    sessionId = sessId;
    date = contribDate;
    contribId = contribId;

    thisConf = myAgenda.find(function(conf){
        return conf.get('id') == confId;
    });

    thisDay = thisConf.get('days').find(function(day) {
        return day.get('date') == date;
    });
    thisSlot = thisDay.get('slots').filter(function(slot) {
        return slot.get('sessionId') == sessionId;
    });
    thisContrib;
    for(slot in thisSlot) {
        if(thisSlot[slot].get('contributions').find(function(contrib) {
            return contrib.get('id') == contribId;
        })) {
            slotId = thisSlot[slot].get('id');
            thisSlot[slot].get('contributions').remove(thisSlot[slot].get('contributions').find(function(contrib) {
                return contrib.get('id') == contribId;
            }));
            if(thisSlot[slot].get('contributions').size() == 0) {
                thisDay.get('slots').remove(thisSlot[slot]);
                sessionRemoved = true;
            }
        }

    }
};
$('#removeFromAgenda').live('click', function(event) {

    removeFromAgenda($(this).attr('confId'), $(this).attr('sessionId'), $(this).attr('day'), $(this).attr('contribId'));

	var dayRemoved = false;
	if(thisDay.get('slots').size() == 0) {
	    confDay = conferenceModel.get('days').find(function(day){
	        return day.get('date')==date;
	    });
	    conferenceModel.get('days').remove(confDay);
	    thisConf.get('days').remove(thisDay);
		dayRemoved = true;
	}

    var confRemoved = false;
    if(thisConf.get('days').size() == 0) {
        myAgenda.remove(thisConf);
        confRemoved = true;
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



	if (confRemoved){
	    $(document).trigger('pageinit');
        $.mobile.changePage('/agenda');
	}
	else{
	    $($(this).parent().parent()[0]).remove();

	    if(sessionRemoved) {
	        $('#li-' + slotId).remove();
	    }

	    if(dayRemoved) {
	        $('#li-'+date).remove();
	        $('#sli-'+date).remove();
	        $.mobile.changePage('#alldays');
	    }
	}

});
$('#removeFromAgenda1').live('click', function(event) {

    removeFromAgenda($(this).attr('confId'), $(this).attr('sessionId'), $(this).attr('day'), $(this).attr('contribId'));
	var dayRemoved = false;
	if(thisDay.get('slots').size() == 0) {
		thisConf.get('days').remove(thisDay);
		dayRemoved = true;
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

	$(this).attr('style', 'display:none;');
	$(this).parent().removeClass('ui-body-f').addClass('ui-body-b');
	$(this).parent().parent().attr('data-theme', 'b');
	$(this).parent().parent().attr('data-content-theme', 'b');
	$($($($($(this).parent().parent()[0]).children()[0])).children()[0]).removeClass('ui-btn-up-f').addClass('ui-btn-up-b');
	$($($($($(this).parent().parent()[0]).children()[0])).children()[0]).removeClass('ui-btn-hover-f').addClass('ui-btn-hover-b');
	$($($($($(this).parent().parent()[0]).children()[0])).children()[0]).attr('data-theme', 'b');
	$($(this).parent().children()[$(this).parent().children().length - 2]).attr('style', 'display:block;').removeClass('ui-btn-up-f').addClass('ui-btn-up-b');
	$($(this).parent().children()[$(this).parent().children().length - 2]).removeClass('ui-btn-hover-f').addClass('ui-btn-hover-b');
	$($(this).parent().children()[$(this).parent().children().length-2]).attr('data-theme', 'b');
});
