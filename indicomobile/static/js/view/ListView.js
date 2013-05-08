var ListView = Backbone.View.extend({
    tagName: 'ul',

    attributes: {
        'data-role': 'listview',
        'data-inset': 'true',
        'data-theme': 'c'
    },

    initialize: function() {
        this.template_file = getHTMLTemplate('lists.html');
        this.template = _.template($(this.template_file).siblings(this.options.template_name).html());
        this.favoritesCollection = new Backbone.Collection();
        if (this.options.favoritesUrl !== undefined){
            this.favoritesCollection.url = this.options.favoritesUrl;
            this.favoritesCollection.fetch();
        }
        this.collection.url = this.options.url;
        this.collection.on('hasChanged', this.appendRender, this);
        this.collection.on('reset', this.render, this);
        this.collection.on('reload', this.initialize, this);
        this.collection.on('error', this.showError, this);
        this.options.page = 1;
        this.collection.fetch();
    },

    showError: function(model, error){
        if(error.status == 401){
            window.location.href = BASE_URL + 'login/';
        } else{
            $(this.options.container).parent().find('.loader').hide();
            $(this.options.container).html('<h4 class="emptyMessage">An error has occured retrieving the list</h4>');
            $.mobile.hidePageLoadingMsg();
        }
    },

    _convertDate: function(date_in) {
        var date = moment(date_in.date + " " + date_in.time);
        var now = moment();
        if (date < now) {
            return "Ongoing";
        } else if (date.diff(now, "days") < 1) {
            return date.format("HH:mm");
        } else {
            return date.format("DD MMM");
        }
    },

    renderItems: function(collection, template, listView){
        self = this;
        collection.each(function(element){
            element.set("short_start_date", self._convertDate(element.get("startDate")));
            element.set("user", userLogged);
            var month = filterDate(element.get('startDate').date).month +
                ' ' + filterDate(element.get('startDate').date).year;
            if (self.options.lastDate === null || self.options.lastDate != month){
                self.options.lastDate = month;
                listView.append('<li data-role="list-divider">'+month+'</li>');
            }
            listView.append(template(element.toJSON()));
        });
    },

    render: function() {
        var collection = this.collection,
        self = this,
        container = $(this.options.container),
        template = this.template,
        empty_message = this.options.empty_message,
        term = this.options.term,
        listView = $(this.el);

        if (collection.size() > 0){
            if (this.collection.at(0).get('error')){
                container.append('<h4 class="emptyMessage">An error has occured retrieving the list</h4>');
            }
            else{

                self.renderItems(collection, template, listView);

                container.append(listView);

                container.trigger('create');
                listView.listview('refresh');
                if (term !== '' && term != ' ' && term !== undefined){
                    for (word in term.split(' ')){
                        container.find('li').highlight(term.split(' ')[word]);
                    }
                }

            }

        }
        else{
            if (container.find('.emptyMessage').length > 0){
                container.find('.emptyMessage').show();
            }
            else{
                container.append('<h4 class="emptyMessage">'+empty_message+'</h4>');
            }
        }
        container.parent().find('.loader').hide();
        $.mobile.hidePageLoadingMsg();
        return this;
    },

    events: {
        "click #addRemoveEvent": "addRemoveEvent"
    },

    addRemoveEvent: function(e) {
        $.mobile.showPageLoadingMsg('c', 'Saving...', true);
        e.preventDefault();
        addRemoveEventAction($(e.currentTarget), this.collection);
        page_id = $.mobile.activePage.attr('id');
        $('div[data-role="page"][id!="'+page_id+'"]').remove();
    }
});


var InfiniteListView = ListView.extend({

    initialize: function () {
        InfiniteListView.__super__.initialize.call(this);
        this.infiniScroll = new Backbone.InfiniScroll(this.collection, {
          success: function(collection, changed) {
              collection.trigger('hasChanged', [changed]);
          },
          includePage : true});
        this.infiniScroll.enableFetch();
    }

});

var SessionsList = ListView.extend({

    renderItems: function(collection, template, listView){

        var self = this,
        lastTitle = null;

        collection.each(function(element){
            element.set("user", userLogged);
            element.set('inFavorites', self.options.favorites);
            if (lastTitle === null || lastTitle != element.get('title')){
                lastTitle = element.get('title');
                var isInFavorites = self.favoritesCollection.find(function(session){
                    return session.get('sessionId') == element.get('sessionId');
                });
                var listItem = template(element.toJSON());
                if (isInFavorites){
                    listItem = listItem.replace('"add"', '"remove"').replace('"c"', '"b"');
                }
                listView.append(listItem);
            }
        });

    },

    events: {
        "click #addRemoveSession": "addRemoveSession"
    },

    addRemoveSession: function(e) {
        $.mobile.showPageLoadingMsg('c', 'Saving...', true);
        e.preventDefault();
        addRemoveSessionAction($(e.currentTarget), this.collection);
        page_id = $.mobile.activePage.attr('id');
        $('div[data-role="page"][id!="'+page_id+'"]').remove();
    }

});

var SessionDaysList = ListView.extend({

    renderItems: function(collection, template, listView){

        var lastDate = null,
        self = this;

        collection.each(function(element){
            if (lastDate === null || lastDate != element.get('startDate').date){
                lastDate = element.get('startDate').date;
                if (self.options.favorites){
                    element.set('conferenceId', 'favorites_'+element.get('conferenceId'));
                }
                listView.append(template(element.toJSON()));
            }
        });

    }

});

var ListByMonthView = InfiniteListView.extend({

    appendRender: function(newitems) {
        var container = $(this.options.container);
        var listView = $(this.el);
        if (newitems[0].length > 0){
            this.renderItems(new Events(newitems[0]), this.template, listView);
            container.append(listView);
            container.trigger('create');
            listView.listview('refresh');
        }
        else{
            container.parent().find('.loader').hide();
        }
    },

    events: {
        "click #addRemoveEvent": "addRemoveEvent"
    }
});

var SimpleEventsAndContributions = ListView.extend({

    renderItems: function(collection, template, listView){

        if (this.options.template_name2 !== undefined){
            this.template2 = _.template($(this.template_file).siblings(this.options.template_name2).html());
        }

        var lastDate = null,
        lastTime = null,
        self = this;

        collection.each(function(element){
            element.set("user", userLogged);
            element.set('inFavorites', self.options.favorites);
            var day = filterDate(element.get('startDate').date).month +
                ' ' + filterDate(element.get('startDate').date).day +
                ', ' + filterDate(element.get('startDate').date).year;
            if (lastDate === null || lastDate != day){
                lastDate = day;
                lastTime = null;
                listView.append('<li data-role="list-divider">'+day+'</li>');
            }
            if (lastTime === null || lastTime != element.get('startDate').time){
                lastTime = element.get('startDate').time;
                listView.append('<li data-role="list-divider">'+hourToText(element.get('startDate').time)+'</li>');
            }
            var isInFavorites = self.favoritesCollection.find(function(contrib){
                if (contrib.get('contributionId') !== undefined){
                    return contrib.get('contributionId') == element.get('contributionId') &&
                    contrib.get('conferenceId') == element.get('conferenceId');
                }
                else{
                    return contrib.get('id') == element.get('id');
                }
            });
            var listItem;
            if (element.get('contributionId') !== undefined){
                listItem = template(element.toJSON());
            }
            else{
                listItem = self.template2(element.toJSON());
            }
            if (isInFavorites){
                listItem = listItem.replace('"add"', '"remove"').replace('"c"', '"b"');
            }
            listView.append(listItem);
        });

    },

    events: {
        "click #addRemoveEvent": "addRemove",
        "click #addRemoveContribution": "addRemove"
    },

    addRemove: function(e) {
        $.mobile.showPageLoadingMsg('c', 'Saving...', true);
        e.preventDefault();
        if ($(e.currentTarget).attr('id') == 'addRemoveContribution'){
            addRemoveContributionAction($(e.currentTarget), this.collection);
        }
        else{
            addRemoveEventAction($(e.currentTarget), this.collection);
        }

        page_id = $.mobile.activePage.attr('id');
        $('div[data-role="page"][id!="'+page_id+'"]').remove();
    }

});

var ContributionListView = ListView.extend({

    renderItems: function(collection, template, listView){

        var lastTime = null,
        lastPosterTime = null,
        listItem,
        self = this;

        collection.each(function(element){
            element.set("user", userLogged);
            element.set('inFavorites', self.options.favorites);
            if (lastTime === null || lastTime != element.get('startDate').time){
                lastTime = element.get('startDate').time;
                listView.append('<li data-role="list-divider">'+hourToText(lastTime)+'</li>');
            }
            if (element.get('isPoster') && !self.options.sessionDay){
                if (lastPosterTime === null || lastPosterTime != element.get('startDate').time){
                    lastPosterTime = element.get('startDate').time;
                    var template2 = _.template($(self.template_file).siblings('#poster').html());
                    if (self.options.favorites){
                        element.set('conferenceId', 'favorites_'+element.get('conferenceId'));
                    }
                    listItem = template2(element.toJSON());
                    listView.append(listItem);
                }
            }
            else{
                var isInFavorites = self.favoritesCollection.find(function(contrib){
                    return contrib.get('contributionId') == element.get('contributionId');
                });
                listItem = template(element.toJSON());
                if (isInFavorites){
                    listItem = listItem.replace('"add"', '"remove"').replace('"c"', '"b"');
                }
                listView.append(listItem);
            }
        });

    },

    events: {
        "click #addRemoveContribution": "addRemoveContribution"
    },

    addRemoveContribution: function(e) {
        $.mobile.showPageLoadingMsg('c', 'Saving...', true);
        e.preventDefault();
        addRemoveContributionAction($(e.currentTarget), this.collection);
        page_id = $.mobile.activePage.attr('id');
        $('div[data-role="page"][id!="'+page_id+'"]').remove();
    }

});

var SpeakerListView = InfiniteListView.extend({

    appendRender: function(newitems) {
        var container = $(this.options.container);
        if (newitems[0].length > 0){
            this.renderItems(new Speakers(newitems[0]), this.template, this.options.term);
        }
        else{
            container.parent().find('.loader').hide();
        }
    },


    renderItems: function(items, template, highlight_term) {
        var collection = items,
        self = this,
        container = $(this.options.container),
        listView = $(this.el);
        container.data('view', this);
        collection.each(function(element){
            if (self.options.lastIndex === null || self.options.lastIndex != element.get('name')[0]){
                self.options.lastIndex = element.get('name')[0];
                listView.append('<li data-role="list-divider">'+element.get('name')[0]+'</li>');
            }
            if (self.options.favorites){
                element.set('conferenceId', 'favorites_'+element.get('conferenceId'));
            }
            listView.append(template(element.toJSON()));
        });

        container.append(listView);

        container.trigger('create');
        listView.listview('refresh');

        if (highlight_term !== '' && highlight_term != ' ' && typeof highlight_term !== 'undefined'){
            for (word in highlight_term.split(' ')){
                container.find('li').highlight(highlight_term.split(' ')[word]);
            }
        }
        $(this.options.container).parent().find('.emptyMessage').hide();
        if (collection.size() < 20 || this.options.favorites){
            $(this.options.container).parent().find('.loader').hide();
        }
        return this;
    },

    render: function(){
        if (this.collection.size() > 0){
            if (this.collection.at(0).get('error')){
                $(this.options.container).append('<h4 class="emptyMessage">An error has occured retrieving the list</h4>');
            }
            else{
                if (this.options.favorites){
                    $(this.el).attr('data-filter', true);
                }
                this.renderItems(this.collection, this.template, this.options.term);
            }
        }
        else {
            $(this.options.container).parent().find('.loader').hide();
            $(this.options.container).parent().find('.emptyMessage').show();
        }
    }
});

var SearchResultsView = SpeakerListView.extend({


    renderItems: function(items, template, highlight_term) {
        var collection = items,
        self = this,
        container = $(this.options.container),
        lastDate = null,
        listView = $(this.el);
        container.data('view', this);
        collection.each(function(element){
            var startDate = moment(element.get("startDate").date);
            element.set("short_start_date", startDate.format("DD MMM"));
            element.set("user", userLogged);
            element.set('inFavorites', false);
            var month = filterDate(element.get('startDate').date).month +
                ' ' + filterDate(element.get('startDate').date).year;
            if (lastDate === '' || lastDate != month){
                lastDate = month;
                listView.append('<li data-role="list-divider">'+month+'</li>');
            }
            var isInFavorites = self.favoritesCollection.find(function(event){
                return event.get('id') == element.get('id');
            });
            listItem = template(element.toJSON());
            if (isInFavorites){
                listItem = listItem.replace('"add"', '"remove"').replace('"c"','"b"');
            }
            listView.append(listItem);
        });

        container.append(listView);

        container.trigger('create');
        listView.listview('refresh');

        if (highlight_term !== '' && highlight_term != ' ' && typeof highlight_term !== 'undefined'){
            for (word in highlight_term.split(' ')){
                container.find('li').highlight(highlight_term.split(' ')[word]);
            }
        }
        $(this.options.container).parent().find('.emptyMessage').hide();
        if (collection.size() < 20){
            $(this.options.container).parent().find('.loader').hide();
        }
        return this;
    },

    events: {
        "click #addRemoveEvent": "addRemoveEvent"
    }

});

var HistoryListView = ListView.extend({

    renderItems: function(collection, template, listView){
        var self = this,
        lastTime = null;
        collection.each(function(element){
            element.set("user", userLogged);
            if (lastTime === null || lastTime != element.get('viewed_at')){
                lastTime = element.get('viewed_at');
                var date = new Date(lastTime);
                listView.append('<li data-role="list-divider">'+lastTime.date+', '+lastTime.time+'</li>');
            }
            listView.append(template(element.toJSON()));
        });

    },

    events: {
        "click #addRemoveEvent": "addRemoveEvent"
    }

});

var NextEventView = ListView.extend({

    initialize: function(){
        this.template_file = getHTMLTemplate('lists.html');
        this.template = _.template($(this.template_file).siblings(this.options.template_name).html());
        this.model.url = this.options.url;
        this.model.on('change:title', this.render, this);
        this.model.fetch();
    },

    render: function(){

        var container = $(this.options.container),
        listView = $(this.el);
        if(this.model.get('type') === undefined){
            this.model.set('type', null);
        }
        listView.append('<li data-role="list-divider">Next event in your favorites</li>');
        listView.append(this.template(this.model.toJSON()));
        container.append(listView);

        container.trigger('create');
        listView.listview('refresh');
    },

});


var TimetableDaysListView = ListView.extend({

    renderItems: function(collection, template, listView){
        var self = this;
        collection.each(function(element){
            listView.append(template(element.toJSON()));
        });

    },


});