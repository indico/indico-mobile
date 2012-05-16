var OngoingContributionsView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true
    },

    initialize: function(){
        var contributionTemplates = getHTMLTemplate('contributions.html');
        this.contributionTemplate = _.template($(contributionTemplates).siblings('#ongoingContribution').html());
    },

    render: function(){
        var contributions = this.collection,
        container = this.options.viewContainer,
        contributionTemplate = this.contributionTemplate,
        listView = $(this.el);

        console.log(contributions)

        if (contributions.size() > 0){
            console.log(contributions)

            contributions.comparator = function(contribution){
                return contribution.get('startDate').time;
            };
            contributions.sort();

            lastTime = ''
            contributions.each(function(contrib){
                if (lastTime === '' || lastTime == contrib.get('startDate').time){
                    lastTime = contrib.get('startDate').time;
                    listView.append('<li data-role="list-divider">' + lastTime.split(':')[0] + 'h' + lastTime.split(':')[1] + '</li>');
                }
                listView.append(contributionTemplate(contrib.toJSON()))
            });

            container.append(listView);
        }
        else{
            container.append('<h4>No contribution today</h4>');
        }
        return this;
    }
});