var SlotsView = Backbone.View.extend({

    initialize : function() {
        this.template1 = _.template(getHTMLTemplate('/slotsList'));
        this.template2 = _.template(getHTMLTemplate('/breakSession'));
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
