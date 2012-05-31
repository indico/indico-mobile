var EventView = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('events.html');
        this.eventPageTemplate = _.template($(dayTemplates).siblings('#eventPage').html());
        this.agendaEventPageTemplate = _.template($(dayTemplates).siblings('#agendaEventPage').html());
        this.meetingPageTemplate = _.template($(dayTemplates).siblings('#meetingPage').html());
        this.agendaMeetingPageTemplate = _.template($(dayTemplates).siblings('#agendaMeetingPage').html());
    },

    render: function(){
        var event = this.options.event,
        agenda = this.options.agenda,
        eventPageTemplate = this.eventPageTemplate,
        agendaEventPageTemplate = this.agendaEventPageTemplate,
        meetingPageTemplate = this.meetingPageTemplate,
        agendaMeetingPageTemplate = this.agendaMeetingPageTemplate;

        console.log(event)
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
            if (event.get('numSessions') === 0){
                $('body').append(meetingPageTemplate(event.toJSON()));
            }
            else{
                $('body').append(eventPageTemplate(event.toJSON()));
            }
        }
        return this;
    }

});

var SimpleEventView = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('events.html');
        this.simpleEventPageTemplate = _.template($(dayTemplates).siblings('#simpleEventPage').html());
        this.agendaSimpleEventPageTemplate = _.template($(dayTemplates).siblings('#agendaSimpleEventPage').html());
    },

    render: function(){
        var event = this.options.event,
        agenda = this.options.agenda,
        simpleEventPageTemplate = this.simpleEventPageTemplate,
        agendaSimpleEventPageTemplate = this.agendaSimpleEventPageTemplate;

        console.log(event.get('startDate'))

        if (typeof event.attributes.id === "undefined"){
            event.attributes = event.attributes[0];
        }
        if (agenda){
            $('body').append(agendaSimpleEventPageTemplate(event.toJSON()));
        }
        else{
            $('body').append(simpleEventPageTemplate(event.toJSON()));
        }
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
    },

    render: function(){
        var container = this.options.viewContainer,
        events = container.data('resultEvents'),
        eventListTemplate = this.eventListTemplate,
        eventListInAgendaTemplate = this.eventListInAgendaTemplate,
        part = container.data('part');

        if (events.size() > 0){
            events.comparator = function(event){
                return String.fromCharCode.apply(String,
                        _.map(event.get('startDate').date.split(""), function (c) {
                            return 0xffff - c.charCodeAt();
                        })
                );
            };
            events.sort();
            if (part === 0){
                container.empty();
            }
            var dates = [];
            var end = false;
            for (var i = part; !end && i < events.size() ; i++){
                if (i < container.data('part') + screen.height/50){
                    var isAlreadyIn = false;
                    var dateYear = filterDate(events.at(i).get('startDate').date).month +
                    ' ' + filterDate(events.at(i).get('startDate').date).year;

                    for (var j = 0; j < dates.length; j++){
                        if (dateYear == dates[j]){
                            isAlreadyIn = true;
                        }
                    }

                    if (!isAlreadyIn){
                        if (events.at(i).get('startDate').date !== ''){
                            dates[dates.length] = dateYear;
                            container.append('<li data-role="list-divider">' + dateYear + '</li>');
                        }
                        else{
                            container.append('<li data-role="list-divider">Date Unknown</li>');
                        }

                    }

                    if (isEventInAgenda(events.at(i).get('id'))){
                        container.append(eventListInAgendaTemplate(events.at(i)));
                    }else{
                        container.append(eventListTemplate(events.at(i)));
                    }
                }
                else{
                    container.data('part', i);
                    end = true;
                }
            }
            if (!end){
                container.data('part', -1);
                $('#loadingEvents').hide();
                container.parent().find('h4').hide();
            }
            else{
                $('#loadingEvents').attr('style', 'display: block; margin: 0 auto; margin-top: 20px; width: 5%;');
                container.parent().find('h4').hide();
            }

        }
        else{
            container.html('<h4>Nothing found</h4>');
        }
        if (part === 0){
            container.trigger('create');
            container.listview('refresh');
        }
        else{
            container.listview('refresh');
        }
        container.trigger('refresh');
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
                var date = new Date(parseInt(event.get('viewedAt'), 10));
                listView.append('<li data-role="list-divider">' + date + '</li>');
                if (isEventInAgenda(event.get('id'))){
                    listView.append(eventListInAgendaTemplate(event));
                }
                else{
                    listView.append(eventListTemplate(event));
                }
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
            var events = loadAgendaEvents();
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