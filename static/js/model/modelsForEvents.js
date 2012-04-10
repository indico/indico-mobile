var Contribution = Backbone.Model.extend({

});

var Contributions = Backbone.Collection.extend({
    model: Contribution
});

var Day = Backbone.Model.extend({

});

Days = Backbone.Collection.extend({
    model : Day
});

var Slot = Backbone.Model.extend({

});

Slots = Backbone.Collection.extend({
    model : Slot
});

var Event = Backbone.Model.extend({

});
Events = Backbone.Collection.extend({
    model : Event
});

initEvent = function(options){
    var eventModel;
    var eventInfo;
    $.ajax({
        type : "GET",
        url : "/eventInfo",
        dataType : "json",
        async: false,
        data : {
            eventID: options,
        },
        success: function(resp){
            eventInfo=resp.results;
        }
    });
    var eventTitle='',
    eventDate='';
    if (eventInfo[0]){
        eventTitle=eventInfo[0].title;
        eventDate=eventInfo[0].startDate.date;
    }
    var event;
    $.ajax({
        type : "GET",
        url : "/eventTT",
        dataType : "json",
        async: false,
        data : {
            eventID: options,
            eventTitle: eventTitle,
            eventDate: eventDate
        },
        success: function(resp){
            event=resp;
        }
    });

    console.log(event);
    eventModel = new Event(event);

    var theseDays = new Days();
    for(day in eventModel.get('days')) {
        var currentDay = eventModel.get('days')[day];
        var isOkToAdd = false;
        for (attributes in currentDay){
            isOkToAdd=true;
        }
        if (isOkToAdd){
            theseDays.add(currentDay);
        }
    }

    theseDays.each(function(day) {
        day.set('slots', new Slots());
        for(slot in day.attributes) {
            if(slot != 'slots') {
                var currentSlot = day.get(slot);
                day.set('date', currentSlot.startDate.date);
                day.get('slots').add(currentSlot);
                day.unset(slot);
            }
        }
        var thisSlots = day.get('slots');
        thisSlots.comparator = function(slot) {
            return slot.get('startDate').time;
        }
        thisSlots.sort();

        thisSlots.each(function(slot) {
            slot.set('temp', new Contributions());
            slot.get('temp').add(slot.get('entries'));
        });
        thisSlots.each(function(slot) {
            var contribs = slot.get('temp').at(0);
            slot.set('contributions', new Contributions());
            for(contrib in contribs.attributes) {
                var contribution = new Contribution(contribs.get(contrib));
                slot.get('contributions').add(contribution);
            }
            slot.unset('temp');
            var thisContribs = slot.get('contributions');
            thisContribs.comparator = function(contrib) {
                return contrib.get('startDate').time;
            }
            thisContribs.sort();
        });
    });
    theseDays.comparator = function(day) {
        return day.get('date');
    };
    theseDays.sort();
    eventModel.set('days',theseDays);
    return eventModel;
}
