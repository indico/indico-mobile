var SlotsView = Backbone.View.extend({
    tagName: 'ul',
    attributes: {
        'data-role':'listview',
        'data-inset':'true'
    },

    initialize : function() {
        var sessionTemplates = getHTMLTemplate('/sessionTemplates');
        this.template1 = _.template($(sessionTemplates).siblings('#slotsList').html());
        this.template2 = _.template($(sessionTemplates).siblings('#breakSession').html());
        this.template3 = _.template($(sessionTemplates).siblings('#slotDetails').html());
        this.template4 = _.template($(sessionTemplates).siblings('#slotDetailsInAgenda').html());
        this.template5 = _.template($(sessionTemplates).siblings('#slotsListInAgenda').html());
    },

    render : function() {
        var sessions = this.options.collection,
        template1 = this.template1,
        template2 = this.template2,
        template3 = this.template3,
        template4 = this.template4,
        template5 = this.template5,
        date = this.options.date,
        eventId = this.options.eventId,
        listView = $(this.el);

        console.log('inSlotView')

        listView.empty();
        var slots = sessions;
        slots.comparator = function(slot){
            return slot.get('title');
        };
        slots.sort();
        slots.comparator = function(slot){
            return slot.get('startDate').time;
        };
        slots.sort();
        slots.each(function(slot) {
            if (slot.get('_type') == 'BreakTimeSchEntry') {
                listView.append(
                        template2(slot.toJSON()));
            } else {
                var contributionsCollection = getSessionContributions(eventId,date, slot.get('sessionId'));
                if (contributionsCollection.size()>0){
                    if (isSessionInAgenda(slot.get('sessionId'), eventId, date)){
                        listView.append(template5(slot.toJSON()));
                    }
                    else{
                        listView.append(template1(slot.toJSON()));
                    }
                }
                else{
                    if (isSessionInAgenda(slot.get('sessionId'), eventId, date)){
                        listView.append(template4(slot.toJSON()));
                    }
                    else{
                        listView.append(template3(slot.toJSON()));
                    }
                }
            }
        });
        console.log($('#sessionInDay-'+eventId+'-'+date));
        $('#sessionInDay-'+eventId+'-'+date).html(listView);
        if (visited){ $('#sessionInDay-'+eventId+'-'+date).trigger('create');}
        else{
            $('#sessionInDay-'+eventId+'-'+date).trigger('refresh');
        }
        return this;
    }
});
