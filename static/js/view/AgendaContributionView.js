var AgendaContributionView = Backbone.View.extend({

    initialize: function() {
        var contributionTemplates = getHTMLTemplate('/contributionTemplates');
        this.agendaContributionTemplate = _.template($(contributionTemplates).siblings('#agendaContribution').html());
    },

    render: function() {
        var contributions = this.options.collection,
        date = this.options.date,
        event = this.options.event,
        session = this.options.session,
        part = parseInt(this.options.part, 10),
        agendaContributionTemplate = this.agendaContributionTemplate;

        if ($('#'+session).html() === '' || part > 0){
            contributions.comparator = function(contrib){
                return contrib.get('title');
            };
            contributions.sort();
            contributions.comparator = function(contrib){
                return contrib.get('startDate').time;
            };
            contributions.sort();

            if(contributions.size() > 15 * (part + 1)) {
                for(var i = part * 15; i < 15 * (part + 1); i++) {
                    $('#' + session).append(agendaContributionTemplate(contributions.at(i).toJSON()));
                }
                $('#' + session).append('<a data-role="button" id="agendaMore" day="' +
                        date + '" sessionId="' + session + '" eventId="' + event + '" value="' +
                        (part + 1) + '">More</a>');

            } else {
                for(var j = part * 15; j < contributions.size(); j++) {
                    $('#' + session).append(agendaContributionTemplate(contributions.at(j).toJSON()));
                }
            }


            $('#' + session).trigger('create');
        }
        return this;
    }

});
