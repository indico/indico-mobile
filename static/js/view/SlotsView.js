var SlotsView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role':'listview',
        'data-inset':'true'
    },

    initialize: function() {
        var sessionTemplates = getHTMLTemplate('/sessionTemplates');
        this.breakSessionTemplate = _.template($(sessionTemplates).siblings('#breakSession').html());
        this.slotsListTemplate = _.template($(sessionTemplates).siblings('#slotsList').html());
        this.slotDetailsTemplate = _.template($(sessionTemplates).siblings('#slotDetails').html());
        this.slotDetailsInAgendaTemplate = _.template($(sessionTemplates).siblings('#slotDetailsInAgenda').html());
        this.slotsListInAgendaTemplate = _.template($(sessionTemplates).siblings('#slotsListInAgenda').html());
        this.agendaSlotsListTemplate = _.template($(sessionTemplates).siblings('#agendaSlotsList').html());
        this.agendaSlotDetailsTemplate = _.template($(sessionTemplates).siblings('#agendaSlotDetails').html());
    },

    render: function() {
        var sessions = this.options.collection,
        container = this.options.container,
        breakSessionTemplate = this.breakSessionTemplate,
        slotsListTemplate = this.slotsListTemplate,
        slotDetailsTemplate = this.slotDetailsTemplate,
        slotDetailsInAgendaTemplate = this.slotDetailsInAgendaTemplate,
        slotsListInAgendaTemplate = this.slotsListInAgendaTemplate,
        agendaSlotsListTemplate = this.agendaSlotsListTemplate,
        agendaSlotDetailsTemplate = this.agendaSlotDetailsTemplate,
        date = this.options.date,
        create = this.options.create,
        eventId = this.options.eventId,
        agenda = this.options.agenda,
        listView = $(this.el);

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
                listView.append(breakSessionTemplate(slot.toJSON()));
            } else {
                var contributionsCollection = getSessionContributions(eventId, date, slot.get('sessionId'));
                if (contributionsCollection.size() > 0){
                    if (agenda){
                        listView.append(agendaSlotsListTemplate(slot.toJSON()));
                    }
                    else if (isSessionInAgenda(slot.get('sessionId'), eventId, date)){
                        listView.append(slotsListInAgendaTemplate(slot.toJSON()));
                    }
                    else{
                        listView.append(slotsListTemplate(slot.toJSON()));
                    }
                }
                else{
                    if (agenda){
                        listView.append(agendaSlotDetailsTemplate(slot.toJSON()));
                    }
                    else if (isSessionInAgenda(slot.get('sessionId'), eventId, date)){
                        listView.append(slotDetailsInAgendaTemplate(slot.toJSON()));
                    }
                    else{
                        listView.append(slotDetailsTemplate(slot.toJSON()));
                    }
                }
            }
        });
        container.html(listView);
        if (create){
            container.trigger('create');
        }
        else{
            container.trigger('refresh');
            container.find('div[data-role="collapsible_favorite"]').collapsible({theme:'c', refresh: true});
        }
        return this;
    }

});
