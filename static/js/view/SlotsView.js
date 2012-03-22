var SlotsView = Backbone.View.extend({

            initialize : function() {
                var slotsList;
                $.ajax({
                    type : 'GET',
                    url : '/slotsList',
                    async : false,
                    success : function(text) {
                        slotsList = text;
                    }
                });
                this.template1 = _.template(slotsList);
                var breakTemplate;
                $.ajax({
                    type : 'GET',
                    url : '/break',
                    async : false,
                    success : function(text) {
                        breakTemplate = text;
                    }
                });
                this.template2 = _.template(breakTemplate);
            },

            render : function() {
                var conference = this.options.collection, template1 = this.template1, template2 = this.template2;

                conference.get('days').each(function(day) {
                    var slots = day.get('slots');
                    slots.each(function(slot) {

                        if (slot.get('_type') == 'BreakTimeSchEntry' || slot.get('contributions').size()==0) {
                            $('#list-' + slot.get('startDate').date).append(
                                    template2(slot.toJSON()));
                        } else {
                            $('#list-' + slot.get('startDate').date).append(
                                    template1(slot.toJSON()));
                        }
                    });
                });
                return this;
            }
        });
