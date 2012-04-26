var EventView = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('/dayTemplates');
        this.eventPageTemplate = _.template($(dayTemplates).siblings('#eventPage').html());
        this.agendaEventPageTemplate = _.template($(dayTemplates).siblings('#agendaEventPage').html());
    },

    render: function(){
        var event = this.options.event,
        agenda = this.options.agenda,
        eventPageTemplate = this.eventPageTemplate,
        agendaEventPageTemplate = this.agendaEventPageTemplate;

        if (typeof event.attributes.id === "undefined"){
            event.attributes = event.attributes[0];
        }
        if (agenda){
            $('body').append(agendaEventPageTemplate(event.attributes));
        }
        else{
            $('body').append(eventPageTemplate(event.attributes));
        }
        return this;
    }

});