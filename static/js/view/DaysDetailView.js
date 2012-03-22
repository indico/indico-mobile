var DaysDetailView = Backbone.View.extend({
	initialize : function() {
	    var daysPage;
	    $.ajax({
            type: 'GET',
            url: '/daysPage',
            async:false,
            success: function(text){
                daysPage = text;
            }
        });
		this.template1 = _.template(daysPage);
	},
	render : function() {
		var  conference = this.collection, template1 = this.template1;

		conference.get('days').each(function(day){
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
