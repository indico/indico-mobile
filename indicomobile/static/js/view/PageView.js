var PageView = Backbone.View.extend({
    
    tagName: 'div',

    attributes: {
        'data-role': 'page'
    },

    initialize: function(){
        var template_file = getHTMLTemplate(this.options.template_file);
        this.template = _.template($(template_file).siblings(this.options.template_name).html());
        if (typeof this.options.url !== 'undefined'){
            this.model.url = this.options.url;
            this.model.on('change', this.render, this);
            this.model.fetch();
        }
        else{
            this.render();
        }
    },

    render: function() {
        var model = this.model,
        container = $(this.options.container),
        template = this.template,
        pageView = $(this.el),
        link = this.options.link;
        if (pageView.html() === ''){
            pageView.attr('id', link);

            if (typeof this.options.event_id !== 'undefined'){
                model.set('conferenceId', this.options.event_id);
            }

            pageView.append(template(model.toJSON()));

            $('body').append(pageView);

            $.mobile.changePage($('div[id="'+link+'"]'));
        }
        return this;

    }

});
var SearchContributionsView = PageView.extend({

    events: {
        "keyup input": "searchContribution"
    },

    searchContribution: function(e){

        if (e.keyCode == 13){
            e.preventDefault();
            var splittedId = $(e.currentTarget).attr('id').split('_');
            var url, container, sessionDay;
            var term = $(e.currentTarget).val();
            if (splittedId.length > 3){
                container = '#sessionDay_list_' + splittedId[1] + '_' + splittedId[2] + '_' + splittedId[3];
                sessionDay = true;
                url = '/searchContrib/event/'+splittedId[1]+'/session/'+splittedId[2]+'/day/'+splittedId[3]+'/?search='+term;
            }
            else{
                container = '#day_list_' + splittedId[1] + '_' + splittedId[2];
                url = '/searchContrib/event/'+splittedId[1]+'/day/'+splittedId[2]+'/?search='+term;
                sessionDay = false;
            }
            $(e.currentTarget).parent().parent().find('.loader').show();
            $(container).empty();

            console.log(url)
            var contributionsView = new ContributionListView({
                container: container,
                collection: new Contributions(),
                url: url,
                template_file: 'contributions.html',
                template_name: '#contribution',
                sessionDay: sessionDay,
                term: term,
                empty_message: 'No contributions found.'
            });
        }

    }
    
});

var SpeakersPage = PageView.extend({

    events: {
        "keyup input": "searchSpeaker"
    },

    searchSpeaker: function(e){

        if (e.keyCode == 13){
            e.preventDefault();
            var splittedId = $(e.currentTarget).attr('id').split('_');
            var eventId = splittedId[1];
            var term = $(e.currentTarget).val();
            var container = $('#speakersContent_' + splittedId[1]);
            $(e.currentTarget).parent().parent().find('.loader').show();
            container.data('view').remove();
            container.data('view').infiniScroll.disableFetch();
            var view = new SpeakerListView({
                container: '#speakersContent_' + splittedId[1],
                collection: new Speakers(),
                url: 'searchSpeaker/'+eventId+'?search='+term,
                template_file: 'speakers.html',
                template_name: '#speakersList',
                term: term
            });
        }

    }

});