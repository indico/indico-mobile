var PageView = Backbone.View.extend({

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
            if(typeof model.get("type") === 'undefined') {
                model.set("event_type", model.get("event").type);
            } else{
                model.set("event_type", model.get("type"));
            }
            if(typeof model.get("title") === 'undefined') {
                model.set("title", model.get("event").title);
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
            model.set("indico_desktop", INDICO_DESKTOP);
            model.set("user", userLogged);
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
            context.set("indico_desktop", INDICO_DESKTOP);
            context.set("user", userLogged);
            context.set("event_type", context.get("type"));
            pageView.append(this.headerTemplate(context.toJSON()));
            pageView.append(this.template(thisDay.toJSON()));
            pageView.append(this.panelsTemplate(context.toJSON()));
            $('body').append(pageView);
            $.mobile.changePage($('div[id="'+link+'"]'));
        }
        return this;

    },

    events: {
        "keyup input": "searchContribution",
        "click a.ui-input-clear": "resetSearch"
    },

    _getContainer: function(info){
        var container = null;
        if (info.length > 4){
            return '#sessionDay_list_favorites_' + info[2] + '_' + info[3] + '_' + info[4];
        } else if (info.length > 3 && info[1] != 'favorites'){
            return '#sessionDay_list_' + info[1] + '_' + info[2] + '_' + info[3];
        } else if (info.length > 3){
            return '#day_list_favorites_' + info[2] + '_' + info[3];
        } else{
            return '#day_list_' + info[1] + '_' + info[2];
        }

    },

    resetSearch: function(e) {
        var info = $(e.currentTarget).siblings().attr("id").split("_");
        var container = this._getContainer(info);
        var term = $(e.currentTarget).val();
        $(container + " .ui-listview > li").show();
    },

    searchContribution: function(e){
        var info = $(e.currentTarget).attr('id').split("_");
        var container = this._getContainer(info);
        var term = $(e.currentTarget).val();
        $(container + " .ui-listview > li").hide();
        var items = $(container + " .ui-listview li.contribItem:contains('"+ term +"')");
        items.each(function(){
            $(this).prevAll(".ui-li-divider:first").show();
        });
        items.show();
    }
});

var SpeakersPage = PageView.extend({

    events: {
        "keyup input": "searchSpeaker",
        "click a.ui-input-clear": "resetSearch"
    },

    _getContainer: function(info){
        if (info.length > 2){
            return '#speakersContent_favorites_' + info[2];
        } else{
            return '#speakersContent_' + info[1];
        }
    },

    resetSearch: function(e) {
        var info = $(e.currentTarget).siblings().attr("id").split("_");
        var container = this._getContainer(info);
        var term = $(e.currentTarget).val();
        $(container + " .ui-listview > li").show();
    },

    searchSpeaker: function(e){
        var info = $(e.currentTarget).attr('id').split("_");
        var container = this._getContainer(info);
        var term = $(e.currentTarget).val();
        $(container + " .ui-listview > li").hide();
        var items = $(container + " .ui-listview li.speakerItem:contains('"+ term +"')");
        items.each(function(){
            $(this).prevAll(".ui-li-divider:first").show();
        });
        items.show();
    }
});