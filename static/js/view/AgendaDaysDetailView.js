var AgendaDaysDetailView = Backbone.View.extend({
    initialize : function() {
        this.template1 = _.template($(getHTMLTemplate('/dayTemplates')).siblings('#dayPage').html());
    },
    render : function() {
        var  event = this.collection, template1 = this.template1;
        event.each(function(day){
            if (day.get('date')){
                $('#myagenda').append(template1(day.toJSON()));
            }
        });


        return this;
    }
});
