var AgendaSlotsView = Backbone.View.extend({
    tagName: 'ul',
    attributes: {
        'data-role':'listview',
        'data-inset':'true'
    },

    initialize : function() {
        var sessionTemplates = getHTMLTemplate('/sessionTemplates');
        this.template1 = _.template($(sessionTemplates).siblings('#agendaSlotsList').html());
        this.template2 = _.template($(sessionTemplates).siblings('#breakSession').html());
        this.template3 = _.template($(sessionTemplates).siblings('#agendaSlotDetails').html());
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
        listView.empty();
        console.log(sessions);

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
                    listView.append(template1(slot.toJSON()));
                }
                else{
                    listView.append(template3(slot.toJSON()));
                }
            }
        });
        $('#sessionInDay-'+eventId+'-'+date).html(listView);
        if (visited){ $('#sessionInDay-'+eventId+'-'+date).trigger('create');}
        else{
            $('#sessionInDay-'+eventId+'-'+date).trigger('refresh');
        }
        return this;
    }
});

