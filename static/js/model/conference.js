var Conference = Backbone.Model.extend({

});
Conferences = Backbone.Collection.extend({
    model : Conference
});

initConf = function(options){
    var conferenceInfo;
    $.ajax({
        type : "GET",
        url : "/getConferenceInfo",
        dataType : "json",
        async: false,
        data : {
            confID: options,
        },
        success: function(resp){
            conferenceInfo=resp.results;
        }
    });
    var confTitle='',
    confDate='';
    if (conferenceInfo[0]){
        confTitle=conferenceInfo[0].title;
        confDate=conferenceInfo[0].startDate.date;
    }
    var conference;
    $.ajax({
        type : "GET",
        url : "/getConferenceTT",
        dataType : "json",
        async: false,
        data : {
            confID: options,
            confTitle: confTitle,
            confDate: confDate
        },
        success: function(resp){
            conference=resp;
        }
    });


    conferenceModel = new Conference(conference);

    var theseDays = new Days();
    for(day in conferenceModel.get('days')) {
        var currentDay = conferenceModel.get('days')[day];
        theseDays.add(currentDay);
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
    conferenceModel.set('days',theseDays);
}
