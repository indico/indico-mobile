var PageView = Backbone.View.extend({
    
    tagName: 'div',

    attributes: {
        'data-role': 'page'
    },

    initialize: function(){
        this.template_file = getHTMLTemplate('pages.html');
        this.template = _.template($(this.template_file).siblings(this.options.template_name).html());
        this.template2 = _.template($(this.template_file).siblings(this.options.template_name2).html());
        this.footerTemplate = _.template($(this.template_file).siblings('#eventFooter').html());
        this.model.url = this.options.url;
        this.model.on('change', this.render, this);
        this.model.fetch();
    },

    render: function() {
        var model = this.model,
        container = $(this.options.container),
        pageView = $(this.el),
        link = this.options.link;
        if (pageView.html() === ''){
            pageView.attr('id', link);

            if (typeof this.options.event_id !== 'undefined'){
                model.set('conferenceId', this.options.event_id);
            }
            if(this.options.agenda){
                console.log(model)
                if (model.get('conferenceId') === undefined){
                    model.set('id', 'agenda_'+model.get('id'));
                }
                else{
                    model.set('conferenceId', 'agenda_'+model.get('conferenceId'));
                }
            }
            if (model.get('type') == 'simple_event'){
                this.template = this.template2;
            }
            pageView.append(this.template(model.toJSON()));
            if (this.options.selectedTab !== undefined){
                pageView.append(this.footerTemplate(model.toJSON()));
                pageView.find(this.options.selectedTab).addClass('ui-btn-active ui-state-persist').removeAttr('rel');
            }
            $('body').append(pageView);

            $.mobile.changePage($('div[id="'+link+'"]'));
        }
        return this;

    }

});
var ContributionsPageView = PageView.extend({

    initialize: function(){
        this.template_file = getHTMLTemplate('pages.html');
        this.template = _.template($(this.template_file).siblings(this.options.template_name).html());
        this.footerTemplate = _.template($(this.template_file).siblings('#eventFooter').html());
        this.collection.url = this.options.url;
        this.collection.on('reset', this.render, this);
        this.collection.fetch();
    },

    render: function() {
        var collection = this.collection,
        container = $(this.options.container),
        pageView = $(this.el),
        thisDay = null,
        prevDay = null,
        nextDay = null,
        link = this.options.link;
        console.log(collection)
        if (pageView.html() === ''){
            pageView.attr('id', link);
            if (collection.at(0).get('sessionId') === undefined){
                for (var i = 0; i < collection.size(); i++){
                    if (collection.at(i).get('date') == this.options.day){
                        thisDay = collection.at(i);
                        if (collection.at(i-1) !== undefined){
                            prevDay = collection.at(i-1).get('date');
                        }
                        if (collection.at(i+1) !== undefined){
                            nextDay = collection.at(i+1).get('date');
                        }
                    }
                }
            }
            else{
                var new_collection = new Days();
                collection.each(function(session){
                    var isDayIn = new_collection.find(function(day){
                        return day.get('date') == session.get('startDate').date;
                    });
                    if (!isDayIn){
                        new_collection.add({'date': session.get('startDate').date,
                                            'conferenceId': session.get('conferenceId'),
                                            'sessionId': session.get('sessionId')});
                    }
                });
                for (var i = 0; i < new_collection.size(); i++){
                    if (new_collection.at(i).get('date') == this.options.day){
                        thisDay = new_collection.at(i);
                        if (new_collection.at(i-1) !== undefined){
                            prevDay = new_collection.at(i-1).get('date');
                        }
                        if (new_collection.at(i+1) !== undefined){
                            nextDay = new_collection.at(i+1).get('date');
                        }
                    }
                }
            }
            if (this.options.agenda){
                thisDay.set('conferenceId', 'agenda_'+thisDay.get('conferenceId'));
            }
            thisDay.set('prevDay', prevDay);
            thisDay.set('nextDay', nextDay);
            pageView.append(this.template(thisDay.toJSON()));
            pageView.append(this.footerTemplate(thisDay.toJSON()));
            $('body').append(pageView);
            console.log('div[id="'+link+'"]')
            $.mobile.changePage($('div[id="'+link+'"]'));
        }
        return this;

    },

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
            container.parent().find('.loader').show();
            container.parent().find('.emptyMessage').hide()
            container.data('view').remove();
            container.data('view').infiniScroll.disableFetch();
            var view = new SpeakerListView({
                container: '#speakersContent_' + splittedId[1],
                collection: new Speakers(),
                url: '/searchSpeaker/event/'+eventId+'/search/'+term+'/',
                template_file: 'speakers.html',
                template_name: '#speakersList',
                term: term
            });
        }

    }

});