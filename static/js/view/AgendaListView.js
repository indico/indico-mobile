var AgendaListView = Backbone.View.extend({
	initialize : function() {
	    var agendaTemplate;
	    $.ajax({
            type: 'GET',
            url: '/agendaTemplate',
            async:false,
            success: function(text){
                agendaTemplate = text;
            }
        });
		this.template = _.template(agendaTemplate);
	},
	render : function() {
		var template = this.template, agendacontribs = new Contributions(),
		agenda = JSON.parse(localStorage.getItem('agenda'));
		finished = false;

		for(var i = 0; i < conferenceModel.get('days').size(); i++) {
			var day = conferenceModel.get('days').at(i);
			var allSessions = day.get('slots');
			for(var j = 0; j < allSessions.size(); j++) {
				var session = allSessions.at(j);
				if (session){
				var allContribs = session.get('contributions');
				for(var k = 0; k < allContribs.size(); k++) {
					var contrib = allContribs.at(k);
					if (contrib){
					if ($.inArray(contrib.get('id'), agenda)!=-1){
						agendacontribs.add(contrib);

					}
						if (agendacontribs.size()==agenda.length){
							finished = true;
						}
}
				}
				}
			}
		}
		$('#agenda-list').empty();
		agendacontribs.each(function(contrib){
			$('#agenda-list').append(template(contrib.toJSON()));
		});

		$('#agenda-list').trigger('create');
		return this;
	}
});
