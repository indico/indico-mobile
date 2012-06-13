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
        this.lectureTemplate = _.template($(contributionTemplates).siblings('#ongoingLecture').html());
        this.posterTemplate = _.template($(contributionTemplates).siblings('#ongoingPoster').html());
        this.collection.url = this.options.url;
        this.collection.on('reset', this.render, this);
        this.collection.fetch();
    },

    render: function(){
        var container = $(this.options.container),
        contributions = this.collection,
        contributionTemplate = this.contributionTemplate,
        posterTemplate = this.posterTemplate,
        lectureTemplate = this.lectureTemplate,
        listView = $(this.el);

        if (contributions.size() > 0){

            var lastTime = '';
            var lastPosterTime = '';
            var end = false;
            var count = 0;
            contributions.each(function(contribution){
                console.log(contribution)
                if (lastTime === '' || lastTime != contribution.get('startDate').time){
                    lastTime = contribution.get('startDate').time;
                    listView.append('<li data-role="list-divider">' + lastTime.split(':')[0] + 'h' + lastTime.split(':')[1] + '</li>');
                }
                if (contribution.get('contributionId') == contribution.get('eventId')){
                    listView.append(lectureTemplate(contributions.at(i).toJSON()));
                }
                else if (contribution.get('type') == 'Poster'){
                    if (lastTime != lastPosterTime){
                        lastPosterTime = contribution.get('startDate').time;
                        listView.append(posterTemplate(contribution.toJSON()));
                        count++;
                    }
                }
                else{
                    listView.append(contributionTemplate(contribution.toJSON()));
                    count++;
                }
            });
            container.append(listView);
        }
        else{
            container.append('<h4>No contribution today</h4>');
        }
        container.trigger('create');

        return this;
    }
});