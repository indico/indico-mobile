var AgendaContributionView = Backbone.View.extend({

    initialize : function() {
        var contributionTemplates = getHTMLTemplate('/contributionTemplates');
        this.template1 = _.template($(contributionTemplates).siblings('#agendaContribution').html());
    },
    render : function() {
        var contributions = this.options.collection,
        date = this.options.date,
        event = this.options.event,
        session = this.options.session,
        part = this.options.part,
        template1 = this.template1,
        template2 = this.template2;

        if ($('#'+session).html()==''||parseInt(part)>0){
            contributions.comparator = function(contrib){
                return contrib.get('title');
            };
            contributions.sort();
            contributions.comparator = function(contrib){
                return contrib.get('startDate').time;
            };
            contributions.sort();

            if(contributions.size() > 15 * (parseInt(part) + 1)) {
                for(var i = parseInt(part) * 15; i < 15 * (parseInt(part) + 1); i++) {
                    $('#' + session).append(template1(contributions.at(i).toJSON()));
                }
                $('#' + session).append('<a data-role="button" id="agendaMore" day="'+date+'" sessionId="'+session+'" eventId="'+event+'" value="' + (parseInt(part) + 1) + '">More</a>');

            } else {
                for(var i = parseInt(part) * 15; i < contributions.size(); i++) {
                    $('#' + session).append(template1(contributions.at(i).toJSON()));
                }
            }


            $('#' + session).trigger('create');
        }



        return this;
    }
});
