var DayDetailView = Backbone.View.extend({

	initialize: function() {
		this.template1 = _.template($(getHTMLTemplate('/dayTemplates')).siblings('#dayPage').html());
	},

	render: function() {
		var  day = this.options.day,
		template1 = this.template1;

	    $('#allpages').append(template1(day.toJSON()));

		return this;
	}

});
