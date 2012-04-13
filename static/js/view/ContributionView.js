var ContributionView = Backbone.View.extend({

    initialize : function() {
        var contributionTemplates = getHTMLTemplate('/contributionTemplates');
        this.template1 = _.template($(contributionTemplates).siblings('#contribution').html());
        this.template2 = _.template($(contributionTemplates).siblings('#contributionInAgenda').html());
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
                    if (isContributionInAgenda(contributions.at(i).get('contributionId'), session, event)){
                        $('#' + session).append(template2(contributions.at(i).toJSON()));
                    }
                    else{
                        $('#' + session).append(template1(contributions.at(i).toJSON()));
                    }
                }
                $('#' + session).append('<a data-role="button" id="more" day="'+date+'" sessionId="'+session+'" eventId="'+event+'" value="' + (parseInt(part) + 1) + '">More</a>');

            } else {
                for(var i = parseInt(part) * 15; i < contributions.size(); i++) {
                    if (isContributionInAgenda(contributions.at(i).get('contributionId'), session, event)){
                        $('#' + session).append(template2(contributions.at(i).toJSON()));
                    }
                    else{
                        $('#' + session).append(template1(contributions.at(i).toJSON()));
                    }
                }
            }


            $('#' + session).trigger('create');
        }



        return this;
    }
});

isContributionInAgenda = function(contribId, sessionId, eventId){

    var myAgendaContributions = loadAgendaContributions();

    var contribInAgenda = myAgendaContributions.find(function(contrib){
        return contrib.get('contributionId')==contribId && contrib.get('sessionId')==sessionId && contrib.get('eventId')==eventId;
    });
    if (contribInAgenda){
        return true;
    }
    else{
        return false;
    }
};
