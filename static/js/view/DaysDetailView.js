var DayDetailView = Backbone.View.extend({

	initialize: function() {
		this.dayPageTemplate = _.template($(getHTMLTemplate('/dayTemplates')).siblings('#dayPage').html());
        this.agendaDayPageTemplate = _.template($(getHTMLTemplate('/dayTemplates')).siblings('#agendaDayPage').html());
	},

	render: function() {
		var  day = this.options.day,
		dayPageTemplate = this.dayPageTemplate,
		agendaDayPageTemplate = this.agendaDayPageTemplate,
		agenda = this.options.agenda;

		if (agenda){
	        $('body').append(agendaDayPageTemplate(day.toJSON()));
		}
		else{
	        $('body').append(dayPageTemplate(day.toJSON()));
		}

		return this;
	}

});
