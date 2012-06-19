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

var SessionDayView = PageView.extend({

    events: {
        "keyup input": "searchContribution"
    },

    searchContribution: function(e){

        if (e.keyCode == 13){
            e.preventDefault();
            var splittedId = $(e.currentTarget).attr('id').split('_');
            var eventId = splittedId[1];
            var sessionId = splittedId[2];
            var dayDate = splittedId[3];
            var term = $(e.currentTarget).val();
            var container = $('#sessionDay_list_' + eventId + '_' + sessionId + '_' + dayDate);
            console.log($(e.currentTarget).parent());
            $(e.currentTarget).parent().parent().find('.loader').show();
            container.empty();
            var contributionsView = new ContributionListView({
                container: '#sessionDay_list_' + eventId + '_' + sessionId + '_' + dayDate,
                collection: new Contributions(),
                url: 'searchContrib/event/'+eventId+'/session/'+sessionId+'/day/'+dayDate+'?search='+term,
                template_file: 'contributions.html',
                template_name: '#contribution',
                sessionDay: true,
                term: term
            });
        }

    }
    
});

var TimetableDayView = PageView.extend({

    events: {
        "keyup input": "searchContribution"
    },

    searchContribution: function(e){

        if (e.keyCode == 13){
            e.preventDefault();
            var splittedId = $(e.currentTarget).attr('id').split('_');
            var eventId = splittedId[1];
            var dayDate = splittedId[2];
            var term = $(e.currentTarget).val();
            var container = $('#day_list_' + splittedId[1] + '_' + splittedId[2]);
            console.log($(e.currentTarget).parent());
            $(e.currentTarget).parent().parent().find('.loader').show();
            container.empty();
            var contributionsView = new ContributionListView({
                container: '#day_list_' + splittedId[1] + '_' + splittedId[2],
                collection: new Contributions(),
                url: 'searchContrib/event/'+eventId+'/day/'+dayDate+'?search='+term,
                template_file: 'contributions.html',
                template_name: '#contribution',
                sessionDay: false,
                term: term
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
            container.empty();
            var speakersView = new SpeakerListView({
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