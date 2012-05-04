var SessionsPageView = Backbone.View.extend({

    initialize: function() {
        var sessionTemplates = getHTMLTemplate('/sessionTemplates');
        this.sessionsPageTemplate = _.template($(sessionTemplates).siblings('#sessionsPage').html());
        this.agendaSessionsPageTemplate = _.template($(sessionTemplates).siblings('#agendaSessionsPage').html());
    },

    render: function() {
        var event = this.options.event,
        container = this.options.container,
        agenda = this.options.agenda,
        sessionsPageTemplate = this.sessionsPageTemplate,
        agendaSessionsPageTemplate = this.agendaSessionsPageTemplate;

        console.log(event);
        if (typeof event.attributes.id === "undefined"){
            event.attributes = event.attributes[0];
        }
        if (agenda){
            container.append(agendaSessionsPageTemplate(event.attributes));
        }
        else{
            container.append(sessionsPageTemplate(event.attributes));
        }

        return this;
    }

});

var SessionsListView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role': 'listview',
        'data-inset': 'true'
    },

    initialize: function() {
        var sessionTemplates = getHTMLTemplate('/sessionTemplates');
        this.sessionsListTemplate = _.template($(sessionTemplates).siblings('#sessionsList').html());
        this.sessionsListInAgendaTemplate = _.template($(sessionTemplates).siblings('#sessionsListInAgenda').html());
        this.agendaSessionsListTemplate = _.template($(sessionTemplates).siblings('#agendaSessionsList').html());
    },

    render: function() {
        var sessions = this.options.sessions,
        agenda = this.options.agenda,
        container = this.options.container
        sessionsListTemplate = this.sessionsListTemplate,
        agendaSessionsListTemplate = this.agendaSessionsListTemplate,
        sessionsListInAgendaTemplate = this.sessionsListInAgendaTemplate,
        listView = $(this.el);

        sessions.comparator = function(session){
            return session.get('title');
        };
        sessions.sort();

        var myAgendaSessions = loadAgendaCompleteSessions();
        var latestTitle = "";
        sessions.each(function(session){
            if (latestTitle === "" || latestTitle != session.get('title')){
                latestTitle = session.get('title');
                if (session.get('_type') != 'BreakTimeSchEntry'){
                    if (agenda){
                        listView.append(agendaSessionsListTemplate(session.attributes));
                    }
                    else{
                        var isSessionInAgenda = myAgendaSessions.find(function(sessionInAgenda){
                            return sessionInAgenda.get('eventId') == session.get('eventId') &&
                            sessionInAgenda.get('sessionId') == session.get('sessionId');
                        });
                        if (isSessionInAgenda){
                            listView.append(sessionsListInAgendaTemplate(session.attributes));
                        }
                        else{
                            listView.append(sessionsListTemplate(session.attributes));
                        }
                    }
                }
            }
        });

        container.append(listView);

        return this;
    },

    events: {
        "click #addRemoveSession": "addRemoveSession"
    },

    addRemoveSession: function(e){
        e.preventDefault();
        var eventId = $(e.currentTarget).attr('eventId');
        var sessionId = $(e.currentTarget).attr('sessionId');
        var action = $(e.currentTarget).attr('action');
        var myAgendaCompleteSessions = loadAgendaCompleteSessions();
        var sessionInAgenda = myAgendaCompleteSessions.find(function(session){
            return session.get('eventId') == eventId &&
            session.get('sessionId') == sessionId;
        });
        if (action == 'add'){
            if (!sessionInAgenda){
                myAgendaCompleteSessions.add({'eventId': eventId, 'sessionId': sessionId});
                addSessionToAgenda(eventId, sessionId);
                $(e.currentTarget).attr('action', 'remove');
                $(e.currentTarget).attr('title', 'Remove this session from my agenda');
                $(e.currentTarget).find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-g');
                $(e.currentTarget).find('.ui-icon-star').removeClass('ui-icon-star').addClass('ui-icon-delete');
            }
        }
        else{
            myAgendaCompleteSessions.remove(sessionInAgenda);
            removeSessionFromAgenda(eventId, sessionId);
            $(e.currentTarget).attr('action', 'add');
            $(e.currentTarget).attr('title', 'Add this session to my agenda');
            $(e.currentTarget).find('.ui-btn-up-g').removeClass('ui-btn-up-g').addClass('ui-btn-up-c');
            $(e.currentTarget).find('.ui-icon-delete').removeClass('ui-icon-delete').addClass('ui-icon-star');
            if (isEventInAgenda(eventId)){
                $('#eventHome').remove();
            }
        }
        localStorage.setItem('complete_sessions', JSON.stringify(myAgendaCompleteSessions.toJSON()));

    }

});

var SessionView = Backbone.View.extend({

    initialize: function() {
        var sessionTemplates = getHTMLTemplate('/sessionTemplates');
        this.sessionPageTemplate = _.template($(sessionTemplates).siblings('#sessionPage').html());
        this.agendaSessionPageTemplate = _.template($(sessionTemplates).siblings('#agendaSessionPage').html());
    },

    render: function() {
        var session = this.options.session,
        container = this.options.container,
        agenda = this.options.agenda,
        sessionPageTemplate = this.sessionPageTemplate,
        agendaSessionPageTemplate = this.agendaSessionPageTemplate;

        if (typeof session.attributes.id === "undefined"){
            session.attributes = session.attributes[0];
        }
        if (agenda){
            container.append(agendaSessionPageTemplate(session.attributes));
        }
        else{
            container.append(sessionPageTemplate(session.attributes));
        }

        return this;
    }

});

var SessionDaysView = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('/dayTemplates');
        this.sessionDaysListTemplate = _.template($(dayTemplates).siblings('#sessionDaysList').html());
        this.agendasessionDaysListTemplate = _.template($(dayTemplates).siblings('#agendaSessionDaysList').html());
    },
    render: function() {
        var container = this.options.container,
        sessions = this.options.sessions,
        create = this.options.create,
        sessionDaysListTemplate = this.sessionDaysListTemplate,
        agendasessionDaysListTemplate = this.agendasessionDaysListTemplate,
        agenda = this.options.agenda;

        sessions.comparator = function(session){
            return session.get('dayDate');
        };
        sessions.sort();

        var lastDay = "";
        sessions.each(function(session) {
            if (lastDay === "" || lastDay != session.get('dayDate')){
                lastDay = session.get('dayDate');
                if(agenda){
                    container.append(agendasessionDaysListTemplate(session.toJSON()));
                }
                else{
                    console.log('append')
                    container.append(sessionDaysListTemplate(session.toJSON()));
                }
            }
        });
        container.trigger('create');

        return this;
    }

});

var SessionDayView = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('/dayTemplates');
        this.sessionDayTemplate = _.template($(dayTemplates).siblings('#sessionDay').html());
        this.agendaSessionDayTemplate = _.template($(dayTemplates).siblings('#agendaSessionDay').html());
    },
    render: function() {
        var container = this.options.container,
        contribution = this.options.contribution,
        create = this.options.create,
        sessionDayTemplate = this.sessionDayTemplate,
        agendaSessionDayTemplate = this.agendaSessionDayTemplate,
        agenda = this.options.agenda;

        if (typeof contribution.attributes.eventId === 'undefined'){
            contribution.attributes = contribution.attributes[0];
        }
        if (agenda){
            container.append(agendaSessionDayTemplate(contribution.attributes));
        }
        else{
            container.append(sessionDayTemplate(contribution.attributes));
        }

        return this;
    }

});


var SessionDayContributions = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('/contributionTemplates');
        this.contributionTemplate = _.template($(dayTemplates).siblings('#contribution').html());
        this.contributionInAgendaTemplate = _.template($(dayTemplates).siblings('#contributionInAgenda').html());
        this.agendaContributionTemplate = _.template($(dayTemplates).siblings('#agendaContribution').html());
    },
    render: function() {
        var container = this.options.container,
        contributions = this.options.contributions,
        create = this.options.create,
        contributionTemplate = this.contributionTemplate,
        agendaContributionTemplate = this.agendaContributionTemplate,
        contributionInAgendaTemplate = this.contributionInAgendaTemplate,
        myAgenda = loadAgendaContributions(),
        agenda = this.options.agenda;

        contributions.comparator = function(contribution){
            return contribution.get('startDate').time;
        };
        contributions.sort();
        var html = "";
        var lastTime = "";
        contributions.each(function(contribution) {
            if (lastTime === ""){
                lastTime = contribution.get('startDate').time;
                splittedTime = lastTime.split(':');
                html = html + '<li data-role="list-divider">' + splittedTime[0] +'h' + splittedTime[1] + '</li>';
                html = html + '<li style="padding-left: 5px !important; padding-right: 5px !important; padding-bottom: 0px !important; padding-top: 0px !important">'+
                              '<div data-role="collapsible-set">';
            }
            else if(lastTime != contribution.get('startDate').time){
                lastTime = contribution.get('startDate').time;
                splittedTime = lastTime.split(':');
                html = html + '</div></li>';
                html = html + '<li data-role="list-divider">' + splittedTime[0] +'h' + splittedTime[1] + '</li>';
                html = html + '<li style="padding-left: 5px !important; padding-right: 5px !important; padding-bottom: 0px !important; padding-top: 0px !important">'+
                                 '<div data-role="collapsible-set">';
            }
            if(agenda){
                html = html + agendaContributionTemplate(contribution.toJSON());
            }
            else{
                var contribInAgenda = myAgenda.find(function(contrib){
                    return contrib.get('eventId') == contribution.get('eventId') &&
                    contrib.get('contributionId') == contribution.get('contributionId');
                });
                if (contribInAgenda){
                    html = html + contributionInAgendaTemplate(contribution.toJSON());
                }
                else{
                    html = html + contributionTemplate(contribution.toJSON());
                }
            }
        });
        container.append(html);
        if (create){
            container.trigger('create');
        }
        else{
            container.trigger('refresh');
        }
        return this;
    }

});