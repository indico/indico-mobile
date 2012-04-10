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
        if ($('#myagenda').length!=0){
            this.template1 = _.template($(sessionTemplates).siblings('#agendaSlotsList').html());
            this.template3 = _.template($(sessionTemplates).siblings('#agendaSlotDetails').html());
        }
        this.template4 = _.template($(sessionTemplates).siblings('#slotDetailsInAgenda').html());
        this.template5 = _.template($(sessionTemplates).siblings('#slotsListInAgenda').html());
    },

    render : function() {
        var event = this.options.collection,
        template1 = this.template1,
        template2 = this.template2,
        template3 = this.template3,
        template4 = this.template4,
        template5 = this.template5,
        date = this.options.date,
        listView = $(this.el);


        var selectedDay = event.get('days').find(function(day) {
            return day.get('date') == date;
        });
            listView.empty();
            var slots = selectedDay.get('slots');
            slots.each(function(slot) {
                if (slot.get('_type') == 'BreakTimeSchEntry') {
                    listView.append(
                            template2(slot.toJSON()));
                } else {
                    if (slot.get('contributions').size()>0){
                        var isInAgenda=false;
                        if (inAgenda){
                            var eventInAgenda = inAgenda.find(function(event){
                                return event.get('id')==slot.get('conferenceId');
                            });
                            if (eventInAgenda){
                                var dayInAgenda = eventInAgenda.get('days').find(function(day){
                                   return day.get('date')==slot.get('startDate').date;
                                });
                                if (dayInAgenda){
                                    var slotInAgenda = dayInAgenda.get('slots').find(function(agendaSlot){
                                        return agendaSlot.get('id') == slot.get('id');
                                    });
                                    if (slotInAgenda){
                                        if(slotInAgenda.get('contributions').size()==slot.get('contributions').size()){
                                            listView.append(
                                                    template5(slot.toJSON()));
                                            isInAgenda=true;
                                        }
                                    }
                                }
                            }
                        }
                        if (!isInAgenda){
                            listView.append(
                                    template1(slot.toJSON()));
                        }
                     }
                    else{
                        var isInAgenda=false;
                        if (inAgenda){
                            var eventInAgenda = inAgenda.find(function(event){
                                return event.get('id')==slot.get('conferenceId');
                            });
                            if (eventInAgenda){
                                var dayInAgenda = eventInAgenda.get('days').find(function(day){
                                   return day.get('date')==slot.get('startDate').date;
                                });
                                if (dayInAgenda){
                                    var slotInAgenda = dayInAgenda.get('slots').find(function(agendaSlot){
                                        return agendaSlot.get('id') == slot.get('id');
                                    });
                                    if (slotInAgenda){
                                        listView.append(
                                                template4(slot.toJSON()));
                                        isInAgenda=true;
                                    }
                                }
                            }
                        }
                        if(!isInAgenda){
                            listView.append(
                                    template3(slot.toJSON()));
                        }
                    }
                }
            });
            $('#sessionInDay-'+date).html(listView);
            if (visited){ $('#sessionInDay-'+date).trigger('create');}
            else{
                $('#sessionInDay-'+date).trigger('refresh');
            }
        return this;
    }
});
