var EventView = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('events.html');
        this.eventPageTemplate = _.template($(dayTemplates).siblings('#eventPage').html());
        this.simpleEventPageTemplate = _.template($(dayTemplates).siblings('#simpleEventPage').html());
        this.agendaEventPageTemplate = _.template($(dayTemplates).siblings('#agendaEventPage').html());
        this.meetingPageTemplate = _.template($(dayTemplates).siblings('#meetingPage').html());
        this.agendaMeetingPageTemplate = _.template($(dayTemplates).siblings('#agendaMeetingPage').html());
        this.options.model.url = this.options.url;
        this.options.model.on("change", this.render, this);
        this.options.model.fetch();
    },

    render: function(){
        var event = this.model,
        agenda = this.options.agenda,
        eventPageTemplate = this.eventPageTemplate,
        agendaEventPageTemplate = this.agendaEventPageTemplate,
        meetingPageTemplate = this.meetingPageTemplate,
        agendaMeetingPageTemplate = this.agendaMeetingPageTemplate,
        simpleEventPageTemplate = this.simpleEventPageTemplate,
        page = this.options.page;

        if (typeof event.attributes.id === "undefined"){
            event.attributes = event.attributes[0];
        }
        if (agenda){
            if (event.get('numSessions') === 0){
                $('body').append(agendaMeetingPageTemplate(event.toJSON()));
            }
            else{
                $('body').append(agendaEventPageTemplate(event.toJSON()));
            }
        }
        else{
            if (event.get('type') == 'simple_event'){
                $('body').append(simpleEventPageTemplate(event.toJSON()));
            }
            else if (event.get('numSessions') === 0){
                $('body').append(meetingPageTemplate(event.toJSON()));
            }
            else{
                $('body').append(eventPageTemplate(event.toJSON()));
            }
        }

        $.mobile.changePage(page);

        return this;
    }

});

var AgendaEventsListView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role': 'listview',
        'data-theme': 'c',
        'data-inset': true
    },

    initialize: function() {
        var eventTemplates = getHTMLTemplate('events.html');
        this.agendaEventListTemplate = _.template($(eventTemplates).siblings('#agendaEventList').html());
    },

    render: function(){
        var container = this.options.viewContainer,
        events = this.collection,
        agendaEventListTemplate = this.agendaEventListTemplate,
        listView = $(this.el);
        if (events.size() > 0){
            listView.empty();

            events.comparator = function(event){
                return String.fromCharCode.apply(String,
                        _.map(event.get('startDate').date.split(""), function (c) {
                            return 0xffff - c.charCodeAt();
                        })
                    );
            };
            events.sort();

            var dates = [];
            events.each(function(event){
                var isAlreadyIn = false;
                var dateYear = filterDate(event.get('startDate').date).month + ' ' +
                filterDate(event.get('startDate').date).year;
                for (var i = 0; i < dates.length; i++){
                    if (dateYear == dates[i]){
                        isAlreadyIn = true;
                    }
                }
                if (!isAlreadyIn){
                    if (event.get('date') !== ''){
                        dates[dates.length] = dateYear;
                        listView.append('<li data-role="list-divider">' + dateYear + '</li>');
                    }
                    else{
                        listView.append('<li data-role="list-divider">Date Unknown</li>');
                    }

                }
                listView.append(agendaEventListTemplate(event));

            });

            listView.trigger('refresh');
            container.html(listView);
            container.trigger('create');
            }
            else{
                container.html('<h4>There is nothing in your agenda</h4>');
            }
        return this;
    }

});

var EventsListView = Backbone.View.extend({

    initialize: function() {
        var eventTemplates = getHTMLTemplate('events.html');
        this.eventListTemplate = _.template($(eventTemplates).siblings('#eventList').html());
        this.eventListInAgendaTemplate = _.template($(eventTemplates).siblings('#eventListInAgenda').html());
        this.collection.url = this.options.url;
        this.collection.on('reset', this.render, this);
        this.collection.on('hasChanged', this.appendRender, this);
        this.collection.fetch();
    },

    appendRender: function(newitems){
        var self = this,
        container = $(this.options.container),
        eventListTemplate = this.eventListTemplate,
        term = this.options.term
        date = container.data('date');
        if (newitems[0].length > 0){
            _.each(newitems[0], function(element){
                var dateYear = filterDate(element.startDate.date).month +
                    ' ' + filterDate(element.startDate.date).year;

                if (date === '' || date != dateYear){
                    date = dateYear;
                    container.data('date', date);
                    container.append('<li data-role="list-divider">' + dateYear + '</li>');
                }
            console.log(element)
                container.append(eventListTemplate(element));
            });
            container.listview('refresh');

            if (term != '' && term != ' ' && typeof term !== 'undefined'){
                for (word in term.split(' ')){
                    container.find('li').highlight(term.split(' ')[word]);
                }
            }
        }
        else{
            container.parent().find('.loader').hide();
        }
    },

    render: function(){
        var container = $(this.options.container),
        events = this.collection,
        eventListTemplate = this.eventListTemplate,
        eventListInAgendaTemplate = this.eventListInAgendaTemplate,
        term = this.options.term;

        this.infiniScroll = new Backbone.InfiniScroll(this.collection, {
          success: function(collection, changed) {
              collection.trigger('hasChanged', [changed]);
          },
          includePage : true});
        this.infiniScroll.enableFetch();

        if (events.size() > 0){
            var date = '';
            var end = false;
            events.each(function(event){
                console.log(event)
                var dateYear = filterDate(event.get('startDate').date).month +
                ' ' + filterDate(event.get('startDate').date).year;

                if (date === '' || date != dateYear){
                    date = dateYear;
                    container.data('date', date);
                    container.append('<li data-role="list-divider">' + dateYear + '</li>');
                }
                container.append(eventListTemplate(event.toJSON()));
            });
            if (term != '' && term != ' ' && typeof term !== 'undefined'){
                for (word in term.split(' ')){
                    container.find('li').highlight(term.split(' ')[word]);
                }
                if(events.size() > 19){
                    container.parent().append('<div class="loader"><h4>Loading...</h4><img src="static/style/images/ajax-loader2.gif"/></div>');
                }
            }
            

        }
        else{
            container.html('<h4>Nothing found</h4>');
        }

        
        $.mobile.hidePageLoadingMsg();
        container.trigger('create');
        container.listview('refresh');
        return this;
    }

});

var HistoryListView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true
    },

    initialize: function() {
        var eventTemplates = getHTMLTemplate('events.html');
        this.eventListTemplate = _.template($(eventTemplates).siblings('#eventList').html());
        this.eventListInAgendaTemplate = _.template($(eventTemplates).siblings('#eventListInAgenda').html());
    },

    render: function(){
        var container = this.options.viewContainer,
        events = this.collection,
        eventListTemplate = this.eventListTemplate,
        eventListInAgendaTemplate = this.eventListInAgendaTemplate,
        part = this.options.part,
        listView = $(this.el);

        console.log(events)

        listView.empty();
        events.comparator = function(event){
            return -parseInt(event.get('viewedAt'), 10);
        };
        events.sort();

        var dates = [];
        if (events.size() > 0){
            events.each(function(event){
                console.log(event)
                var date = new Date(parseInt(event.get('viewedAt'), 10));
                listView.append('<li data-role="list-divider">' + date + '</li>');

                listView.append(eventListTemplate(event.toJSON()));
            });
            container.html(listView);
        }
        else{
            container.html('<h4>No history yet.</h4>');
        }
        container.trigger('create');
        return this;
    }

});


var RecentEventsView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true
    },

    initialize: function() {
        var eventTemplates = getHTMLTemplate('events.html');
        this.eventListTemplate = _.template($(eventTemplates).siblings('#eventList').html());
        this.eventListInAgendaTemplate = _.template($(eventTemplates).siblings('#eventListInAgenda').html());
    },

    render: function(){
        var container = this.options.viewContainer,
        events = this.collection,
        eventListTemplate = this.eventListTemplate,
        eventListInAgendaTemplate = this.eventListInAgendaTemplate,
        part = parseInt(this.options.part, 10),
        listView = $(this.el);

        if (events === null){
            container.html('<h3>No events for the moment.</h3>');
        }
        else {
            if(part == 0){
                if (container.attr('id') == 'futureEventList'){
                    container.append('<h3>Future events</h3>');
                }
                else{
                    container.append('<h3>Ongoing events</h3>');
                }
            }
            events.comparator = function(event){
                return String.fromCharCode.apply(String,
                        _.map(event.get('startDate').date.split(""), function (c) {
                            return 0xffff - c.charCodeAt();
                        })
                );

            };
            events.sort();

            var dates = [];
            events.each(function(event){
                var date = event.get('startDate').date;

                var isAlreadyIn = false;
                var dateYear = filterDate(date).month + ' ' + filterDate(date).year;

                for (var i = 0; i < dates.length; i++){
                    if (dateYear == dates[i]){
                        isAlreadyIn = true;
                    }
                }

                if (!isAlreadyIn){
                    if (event.get('date') !== ''){
                        dates[dates.length] = dateYear;
                        listView.append('<li data-role="list-divider">' + dateYear + '</li>');
                    }
                    else{
                        listView.append('<li data-role="list-divider">Date Unknown</li>');
                    }

                }

                var isInAgenda = false;
                if (isEventInAgenda(event.get('id'))){
                    listView.append(eventListInAgendaTemplate(event));
                }
                else{
                    listView.append(eventListTemplate(event));
                }

            });
            container.append(listView);
            if (part > 0){
                listView.listview('refresh');
            }
//            if (events.size() == 10){
//                if (container.attr('id') == 'futureEventList'){
//                container.append('<a href="#" data-role="button" id="moreFutureEvents" part="' + (part + 10) + '">more</a>');
//                }
//                else{
//                    container.append('<a href="#" data-role="button" id="moreOngoingEvents" part="' + (part + 10) + '">more</a>');
//                }
//            }
        }
        container.trigger('create');
        return this;
    }

});

var NextEventView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role': 'listview'
    },

    initialize: function(){
    },

    render: function(){
        var container = this.options.container,
        contrib = this.options.contrib,
        listView = $(this.el);

        if(typeof contrib.get('id') !== 'undefined'){
            listView.append('<li><a class="nextEvent" rel="external" href="/events#event_'+contrib.get('id')+
                            '_agenda"><h3>Your next event:<br>'+contrib.get('title')+'</h3><p>'+
                            contrib.get('startDate').date+'<br>'+
                            contrib.get('startDate').time+'</p></a></li>');

        }
        else{
            var events = myAgenda.getInstance().events;
            var event = events.find(function(event){
                return event.get('id') == contrib.get('eventId');
            });
            listView.append('<li><a class="nextEvent" rel="external" href="/events#contribution_'+contrib.get('eventId')+'_'+contrib.get('contributionId')+
                            '_agenda"><h3>Your next event:<br>'+contrib.get('title')+'</h3><p>'+
                            event.get('title')+'<br>'+
                            contrib.get('startDate').date+'<br>'+
                            contrib.get('startDate').time+'</p></a></li>');
        }

        container.append(listView);
        container.trigger('create');
        return this;
    }


});