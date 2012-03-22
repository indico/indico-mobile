var ContributionView = Backbone.View.extend({

    initialize : function() {
        var contribution;
        if ($('#myagenda').length!=0){
            $.ajax({type: 'GET', url: '/agendaContribution', async:false, success: function(text){contribution = text;}});
        }
        else{
            $.ajax({type: 'GET', url: '/contribution', async:false, success: function(text){ contribution = text; } });
        }
        this.template1 = _.template(contribution);
        var contributionAgenda;
        $.ajax({
            type: 'GET',
            url: '/contributionAgenda',
            async:false,
            success: function(text){
                contributionAgenda = text;
            }
        });
        this.template2 = _.template(contributionAgenda);
    },
    render : function() {
        var conference = this.options.collection,
        date = this.options.date,
        session = this.options.session,
        part = this.options.part,
        template1 = this.template1,
        template2 = this.template2;

        conference.get('days').each(function(day) {
            if(day.get('date') == date) {
                var slots = day.get('slots');
                var currentSlot;
                slots.each(function(slot) {
                    if(slot.get('id') == session) {
                        currentSlot = slot;
                    }
                });
                var contribs = currentSlot.get('contributions');

                if(contribs.size() > 15 * (parseInt(part) + 1)) {
                    for(var i = parseInt(part) * 15; i < 15 * (parseInt(part) + 1); i++) {
                        addContributionToView(conference, day, currentSlot, date, session, contribs, i, template1, template2);
                    }
                    $('#' + currentSlot.get('id')).append('<a data-role="button" id="more" day="'+date+'" sessionId="'+session+'" value="' + (parseInt(part) + 1) + '">More</a>');

                } else {
                    for(var i = parseInt(part) * 15; i < contribs.size(); i++) {
                        addContributionToView(conference, day, currentSlot,date, session, contribs, i, template1, template2);
                    }
                }


                $('#' + currentSlot.get('id')).trigger('create');
            }
        });
        $.mobile.hidePageLoadingMsg();
        return this;
    }
});

addContributionToView = function(conference, day, currentSlot, date, session, contribs, i, template1, template2){
    if (inAgenda){
        var confInAgenda = inAgenda.find(function(conf){
            return conf.get('id')==conference.get('id');
        });
        if (confInAgenda){
            var dayInAgenda = confInAgenda.get('days').find(function(day){
                return day.get('date')==date;
            });
            var isInAgenda=false;
            if (dayInAgenda){
                var slotInAgenda = dayInAgenda.get('slots').find(function(slot){
                    return slot.get('id')==session;
                });
                if (slotInAgenda){
                    var contribInAgenda = slotInAgenda.get('contributions').find(function(contrib){
                        return contrib.get('id')==contribs.at(i).get('id');
                    });
                    if (contribInAgenda){
                        isInAgenda=true;
                        $('#' + currentSlot.get('id')).append(template2(contribs.at(i).toJSON()));
                    }
                }
            }
        }

        if (!isInAgenda){
            $('#' + currentSlot.get('id')).append(template1(contribs.at(i).toJSON()));
        }
    }
    else{
        $('#' + currentSlot.get('id')).append(template1(contribs.at(i).toJSON()));
    }
}
