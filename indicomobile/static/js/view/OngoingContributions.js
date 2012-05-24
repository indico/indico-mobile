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
    },

    render: function(){
        var container = this.options.viewContainer,
        create = this.options.create,
        contributionTemplate = this.contributionTemplate,
        posterTemplate = this.posterTemplate,
        lectureTemplate = this.lectureTemplate,
        listView = $(this.el);

        var contributions = container.data('contributions'),
        part = container.data('part');

        if (contributions.size() > 0){

            contributions.comparator = function(contribution){
                return contribution.get('startDate').time;
            };
            contributions.sort();

            var lastTime = container.data('lastTime');
            var end = false;
            var count = 0;
            for (var i = part; i < contributions.size() && !end; i++){
                console.log(contributions.at(i))
                if (count < part + screen.height/50){
                    if (lastTime === '' || lastTime != contributions.at(i).get('startDate').time){
                        lastTime = contributions.at(i).get('startDate').time;
                        listView.append('<li data-role="list-divider">' + lastTime.split(':')[0] + 'h' + lastTime.split(':')[1] + '</li>');
                    }
                    if (contributions.at(i).get('contributionId') == contributions.at(i).get('eventId')){
                        listView.append(lectureTemplate(contributions.at(i).toJSON()));
                    }
                    else if (contributions.at(i).get('type') == 'Poster'){
                        if (lastTime != container.data('lastPosterTime')){
                            container.data('lastPosterTime', contributions.at(i).get('startDate').time);
                            listView.append(posterTemplate(contributions.at(i).toJSON()));
                            count++;
                        }
                    }
                    else{
                        listView.append(contributionTemplate(contributions.at(i).toJSON()));
                        count++;
                    }
                }
                else{
                    container.data('part', i);
                    container.data('lastTime', lastTime);
                    end = true;
                }
            }
            if (create){
                container.append(listView);
                container.append('<div class="loader">Loading...<div>');
                if (!end){
                    container.data('part', -1);
                    container.find('.loader').hide();
                }
            }
            else{
                listView.listview('refresh');
                if (!end){
                    container.data('part', -1);
                    container.find('.loader').hide();
                }
            }
        }
        else{
            container.append('<h4>No contribution today</h4>');
            container.data('part', -1);
        }
        return this;
    }
});