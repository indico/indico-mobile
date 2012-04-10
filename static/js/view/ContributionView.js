var ContributionView = Backbone.View.extend({

    initialize : function() {
        var contributionTemplates = getHTMLTemplate('/contributionTemplates');
        if ($('#myagenda').length!=0){
            this.template1 = _.template($(contributionTemplates).siblings('#agendaContribution').html());
        }
        else{
            this.template1 = _.template($(contributionTemplates).siblings('#contribution').html());
        }
        this.template2 = _.template($(contributionTemplates).siblings('#contributionInAgenda').html());
    },
    render : function() {
        var event = this.options.collection,
        date = this.options.date,
        session = this.options.session,
        part = this.options.part,
        template1 = this.template1,
        template2 = this.template2;

        event.get('days').each(function(day) {
            if(day.get('date') == date) {
                var slots = day.get('slots');
                var currentSlot;
                slots.each(function(slot) {
                    if(slot.get('id') == session) {
                        currentSlot = slot;
                    }
                });
                if ($('#' + currentSlot.get('id')).html()==''||parseInt(part)>0){
                var contribs = currentSlot.get('contributions');
                if(contribs.size() > 15 * (parseInt(part) + 1)) {
                    for(var i = parseInt(part) * 15; i < 15 * (parseInt(part) + 1); i++) {
                        addContributionToView(event, day, currentSlot, date, session, contribs, i, template1, template2);
                    }
                    $('#' + currentSlot.get('id')).append('<a data-role="button" id="more" day="'+date+'" sessionId="'+session+'" value="' + (parseInt(part) + 1) + '">More</a>');

                } else {
                    for(var i = parseInt(part) * 15; i < contribs.size(); i++) {
                        addContributionToView(event, day, currentSlot,date, session, contribs, i, template1, template2);
                    }
                }


                $('#' + currentSlot.get('id')).trigger('create');
                }

            }
        });
        return this;
    }
});

addContributionToView = function(event, day, currentSlot, date, session, contribs, i, template1, template2, template3){
    if (inAgenda){
        var isInAgenda=false;
        var eventInAgenda = inAgenda.find(function(agendaEvent){
            return agendaEvent.get('id')==event.get('id');
        });
        if (eventInAgenda){
            var dayInAgenda = eventInAgenda.get('days').find(function(day){
                return day.get('date')==date;
            });
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
