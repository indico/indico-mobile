var DaysDetailView = Backbone.View.extend({
	initialize : function() {
		this.template1 = _.template($(getHTMLTemplate('/dayTemplates')).siblings('#dayPage').html());
	},
	render : function() {
		var  event = this.collection, template1 = this.template1;
		event.get('days').each(function(day){
			if (day.get('date')){
			    if ($('#allpages').length!=0){
			        $('#allpages').append(template1(day.toJSON()));
			    }
			    else if ($('#myagenda').length!=0){
			        $('#myagenda').append(template1(day.toJSON()));
			    }
		}
		});


		return this;
	}
});
