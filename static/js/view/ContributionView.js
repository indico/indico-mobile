var ContributionView = Backbone.View.extend({

    initialize: function() {
        var contributionTemplates = getHTMLTemplate('/contributionTemplates');
        this.contributionTemplate = _.template($(contributionTemplates).siblings('#contribution').html());
        this.contributionInAgendaTemplate = _.template($(contributionTemplates).siblings('#contributionInAgenda').html());
    },

    render: function() {
        var contributions = this.options.collection,
        date = this.options.date,
        event = this.options.event,
        session = this.options.session,
        part = parseInt(this.options.part, 10),
        contributionTemplate = this.contributionTemplate,
        contributionInAgendaTemplate = this.contributionInAgendaTemplate;

        if ($('#' + session).html() === '' || part > 0) {
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
                    if (isContributionInAgenda(contributions.at(i).get('contributionId'), session, event)){
                        $('#' + session).append(contributionInAgendaTemplate(contributions.at(i).toJSON()));
                    }
                    else{
                        $('#' + session).append(contributionTemplate(contributions.at(i).toJSON()));
                    }
                }
                $('#' + session).append('<a data-role="button" id="more" day="' + date + '" sessionId="' +
                        session + '" eventId="' + event + '" value="' + (part + 1) + '">More</a>');

            } else {
                for(var j = part * 15; j < contributions.size(); j++) {
                    if (isContributionInAgenda(contributions.at(j).get('contributionId'), session, event)){
                        $('#' + session).append(contributionInAgendaTemplate(contributions.at(j).toJSON()));
                    }
                    else{
                        $('#' + session).append(contributionTemplate(contributions.at(j).toJSON()));
                    }
                }
            }
            $('#' + session).trigger('create');
        }
        return this;
    }

});
