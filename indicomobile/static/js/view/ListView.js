var ListView = Backbone.View.extend({
    tagName: 'ul',

    attributes: {
        'data-role': 'listview',
        'data-inset': 'true',
        'data-theme': 'c'
    },

    initialize: function() {
        var template_file = getHTMLTemplate(this.options.template_file);
        this.template = _.template($(template_file).siblings(this.options.template_name).html());

        if (typeof this.options.url !== 'undefined'){
            this.collection.url = this.options.url;
            this.collection.on('reset', this.render, this);
            this.collection.fetch();
        }
        else{
            this.render();
        }
    },

    render: function() {
        var collection = this.collection,
        container = $(this.options.container),
        template = this.template,
        empty_message = this.options.empty_message;
        listView = $(this.el);

        if (collection.size() > 0){

            collection.each(function(element){
                listView.append(template(element.toJSON()));
            });

            container.append(listView);

            container.trigger('create');
            listView.listview('refresh');
            container.parent().find('.loader').hide();

        }
        else{
            container.append('<h3 class="emptyMessage">'+empty_message+'</h4>');
        }

        return this;
    }
});

var SessionDaysList = ListView.extend({

    render: function() {
        var collection = this.collection,
        container = $(this.options.container),
        template = this.template,
        listView = $(this.el),
        lastDate = null;

        collection.each(function(element){
            if (lastDate === null || lastDate != element.get('startDate').date){
                lastDate = element.get('startDate').date;
                listView.append(template(element.toJSON()));
            }
        });

        container.append(listView);

        container.trigger('create');
        listView.listview('refresh');
        container.parent().find('.loader').hide();

        return this;
    }

});

var ListByMonthView = ListView.extend({

    render: function() {
        var collection = this.collection,
        container = $(this.options.container),
        template = this.template,
        listView = $(this.el),
        empty_message = this.options.empty_message,
        lastDate = '';

        if (collection.size() > 0){
            collection.each(function(element){
                var month = filterDate(element.get('startDate').date).month +
                    ' ' + filterDate(element.get('startDate').date).year;
                if (lastDate === '' || lastDate != month){
                    lastDate = month;
                    listView.append('<li data-role="list-divider">'+month+'</li>');
                }
                listView.append(template(element.toJSON()));
            });

            container.append(listView);

            container.trigger('create');
            listView.listview('refresh');
            container.parent().find('.loader').hide();
        }
        else{
            container.append('<h3 class="emptyMessage">'+empty_message+'</h4>');
            container.parent().find('.loader').hide();
        }


        return this;

    }

});

var SpeakerContribsListView = ListView.extend({

    render: function() {
        var collection = this.collection,
        container = $(this.options.container),
        template = this.template,
        listView = $(this.el),
        lastDate = null,
        lastHour = null;

        collection.each(function(element){
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
            listView.append(template(element.toJSON()));
        });

        container.append(listView);

        container.trigger('create');
        listView.listview('refresh');
        container.parent().find('.loader').hide();

        return this;

    }

});

var ContributionListView = ListView.extend({

    initialize: function() {
        ContributionListView.__super__.initialize.call(this);
        this.lastTime = null;
    },

    render: function() {
        var self = this,
        collection = this.collection,
        container = $(this.options.container),
        template = this.template,
        listView = $(this.el),
        term = this.options.term,
        lastTime = null,
        lastPosterTime = null;

        collection.each(function(element){
            if (lastTime === null || lastTime != element.get('startDate').time){
                lastTime = element.get('startDate').time;
                listView.append('<li data-role="list-divider">'+hourToText(lastTime)+'</li>');
            }
            if (element.get('isPoster') && !self.options.sessionDay){
                if (lastPosterTime === null || lastPosterTime != element.get('startDate').time){
                    lastPosterTime = element.get('startDate').time;
                    var template_file = getHTMLTemplate(self.options.template_file);
                    var template2 = _.template($(template_file).siblings('#poster').html());
                    listView.append(template2(element.toJSON()))
                }
            }
            else{
                listView.append(template(element.toJSON()));
            }
        });

        container.append(listView);

        container.trigger('create');
        listView.listview('refresh');
        container.parent().find('.loader').hide();

        if (term != '' && term != ' ' && typeof term !== 'undefined'){
            for (word in term.split(' ')){
                container.find('li').highlight(term.split(' ')[word]);
            }
        }

        return this;

    }

});

var SpeakerListView = ListView.extend({
    initialize: function () {
        var template_file = getHTMLTemplate(this.options.template_file);
        this.template = _.template($(template_file).siblings(this.options.template_name).html());
        this.collection.on('hasChanged', this.appendRender, this);
        this.collection.on('reset', this.render, this);
        this.collection.url = this.options.url;
        this.collection.fetch();

        this.infiniScroll = new Backbone.InfiniScroll(this.collection, {
          success: function(collection, changed) {
              collection.trigger('hasChanged', [changed]);
          },
          includePage : true});
        this.infiniScroll.enableFetch();
    },

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
            listView.append(template(element.toJSON()));
        });

        container.append(listView);

        container.trigger('create');
        listView.listview('refresh');

        if (highlight_term != '' && highlight_term != ' ' && typeof highlight_term !== 'undefined'){
            for (word in highlight_term.split(' ')){
                container.find('li').highlight(highlight_term.split(' ')[word]);
            }
        }
        $(this.options.container).parent().find('.emptyMessage').hide();
        return this;
    },

    render: function(){
        if (this.collection.size() > 0){
            this.renderItems(this.collection, this.template, this.options.term);
        }
        else {
            $(this.options.container).parent().find('.loader').hide();
            $(this.options.container).parent().find('.emptyMessage').show();
        }
    }
});