var PageView = Backbone.View.extend({

    userLoggedUrl: BASE_URL +'user/',

    tagName: 'div',

    attributes: {
        'data-role': 'page'
    },

    initialize: function(){
        this.template_file = getHTMLTemplate('pages.html');
        this.template = _.template($(this.template_file).siblings(this.options.template_name).html());
        this.template2 = _.template($(this.template_file).siblings(this.options.template_name2).html());
        this.panelsTemplate = _.template($(this.template_file).siblings('#eventPanels').html());
        this.headerTemplate = _.template($(this.template_file).siblings('#eventHeader').html());
        this.user = new User();
        this.user.url = this.userLoggedUrl;
        this.user.fetch();
        this.model.url = this.options.url;
        this.model.on('change', this.render, this);
        this.model.on('error', this.showError, this);
        this.model.fetch();
    },

    showError: function(model, error) {
        $.mobile.hidePageLoadingMsg();
        if(error.status == 401){
            window.location.href = BASE_URL + 'login/';
        } else if (error.status == 404) {
            alert('The event does not exist');
        } else{
            alert('An error has occured');
        }
    },

    render: function() {
        var model = this.model;
        container = $(this.options.container);
        pageView = $(this.el);
        link = this.options.link;
        pageView.trigger('create');
        if (pageView.html() === ''){
            pageView.attr('id', link);

            if (typeof this.options.event_id !== 'undefined'){
                model.set('conferenceId', this.options.event_id);
            }
            if(this.options.favorites){
                if (model.get('conferenceId') === undefined){
                    model.set('id', 'favorites_'+model.get('id'));
                }
                else{
                    model.set('conferenceId', 'favorites_'+model.get('conferenceId'));
                }
            }
            if (model.get('type') == 'simple_event'){
                this.template = this.template2;
            }
            if(model.get("startDate")!==undefined){
                var startDate = moment(model.get("startDate").date + " " + model.get("startDate").time) ;
                model.set("human_start_date", startDate.format("MMMM DD, YYYY"));
                model.set("human_start_time", startDate.format("HH mm"));
                model.set("human_end_date", moment(model.get("endDate").date).format("MMMM DD, YYYY"));
            }
            model.set("base_url", BASE_URL);
            model.set("user", this.user.get("username"));
            pageView.append(this.headerTemplate(model.toJSON()));
            pageView.append(this.template(model.toJSON()));
            pageView.append(this.panelsTemplate(model.toJSON()));

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
        this.headerTemplate = _.template($(this.template_file).siblings('#eventHeader').html());
        this.panelsTemplate = _.template($(this.template_file).siblings('#eventPanels').html());
        this.collection.url = this.options.url;
        this.context = new Event();
        this.context.url = this.options.contextUrl;
        this.context.fetch();
        this.user = new User();
        this.user.url = this.userLoggedUrl;
        this.user.fetch();
        this.collection.on('reset', this.render, this);
        this.collection.fetch();
    },

    render: function() {
        var collection = this.collection;
        var context = this.context;
        container = $(this.options.container);
        pageView = $(this.el);
        thisDay = null;
        prevDay = null;
        nextDay = null;
        link = this.options.link;
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
                for (var j = 0; j < new_collection.size(); j++){
                    if (new_collection.at(j).get('date') == this.options.day){
                        thisDay = new_collection.at(j);
                        if (new_collection.at(j-1) !== undefined){
                            prevDay = new_collection.at(j-1).get('date');
                        }
                        if (new_collection.at(j+1) !== undefined){
                            nextDay = new_collection.at(j+1).get('date');
                        }
                    }
                }
            }
            if (this.options.favorites){
                thisDay.set('conferenceId', 'favorites_'+thisDay.get('conferenceId'));
            }
            thisDay.set('conferenceTitle', thisDay.get('conferenceTitle'));
            thisDay.set('prevDay', prevDay);
            thisDay.set('nextDay', nextDay);

            if(thisDay.get("startDate")!==undefined){
                var startDate = moment(thisDay.get("startDate").date + " " + thisDay.get("startDate").time);
                thisDay.set("human_end_date", moment(thisDay.get("endDate").date).format("MMMM DD, YYYY"));
                thisDay.set("human_start_date", startDate.format("MMMM DD, YYYY"));
                thisDay.set("human_start_time", startDate.format("HH mm"));
            } else {
                var date = moment(thisDay.get("date"));
                thisDay.set("human_date", date.format("MMMM DD, YYYY"));
            }
            context.set("base_url", BASE_URL);
            context.set("user", this.user.get("username"));
            pageView.append(this.headerTemplate(thisDay.toJSON()));
            pageView.append(this.template(thisDay.toJSON()));
            pageView.append(this.panelsTemplate(context.toJSON()));
            $('body').append(pageView);
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
            var url, container, sessionDay, favorites, user_id;
            var term = $(e.currentTarget).val();
            if (splittedId.length > 4){
                user_id = getUserId();
                favorites = true;
                container = '#sessionDay_list_favorites_' + splittedId[2] + '_' + splittedId[3] + '_' + splittedId[4];
                sessionDay = true;
                url = BASE_URL + 'favorites/searchContrib/event/'+splittedId[2]+
                '/session/'+splittedId[3]+
                '/day/'+splittedId[4]+
                '/search/'+term+'/';
            }
            else if (splittedId.length > 3 && splittedId[1] != 'favorites'){
                container = '#sessionDay_list_' + splittedId[1] + '_' + splittedId[2] + '_' + splittedId[3];
                sessionDay = true;
                favorites = false;
                url = BASE_URL + 'searchContrib/event/'+splittedId[1]+
                '/session/'+splittedId[2]+
                '/day/'+splittedId[3]+
                '/search/'+term+'/';
            }
            else if (splittedId.length > 3){
                user_id = getUserId();
                favorites = true;
                container = '#day_list_favorites_' + splittedId[2] + '_' + splittedId[3];
                url = BASE_URL + 'favorites/searchContrib/event/'+splittedId[2]+
                '/day/'+splittedId[3]+
                '/search/'+term+'/';
                sessionDay = false;
            }
            else{
                favorites = false;
                container = '#day_list_' + splittedId[1] + '_' + splittedId[2];
                url = BASE_URL + 'searchContrib/event/'+splittedId[1]+'/day/'+splittedId[2]+'/search/'+term+'/';
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
                favorites: favorites,
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
            container.parent().find('.emptyMessage').hide();
            container.data('view').remove();
            container.data('view').infiniScroll.disableFetch();
            var view = new SpeakerListView({
                container: '#speakersContent_' + splittedId[1],
                collection: new Speakers(),
                url: BASE_URL + 'searchSpeaker/event/'+eventId+'/search/'+term+'/',
                template_file: 'speakers.html',
                template_name: '#speakersList',
                term: term
            });
        }

    }

});