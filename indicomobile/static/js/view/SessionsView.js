var SessionsPageView = Backbone.View.extend({

    initialize: function() {
        var sessionTemplates = getHTMLTemplate('sessions.html');
        this.sessionsPageTemplate = _.template($(sessionTemplates).siblings('#sessionsPage').html());
        this.agendaSessionsPageTemplate = _.template($(sessionTemplates).siblings('#agendaSessionsPage').html());
    },

    render: function() {
        var event = this.options.event,
        container = this.options.container,
        agenda = this.options.agenda,
        sessionsPageTemplate = this.sessionsPageTemplate,
        agendaSessionsPageTemplate = this.agendaSessionsPageTemplate;

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
        var sessionTemplates = getHTMLTemplate('sessions.html');
        this.sessionsListTemplate = _.template($(sessionTemplates).siblings('#sessionsList').html());
        this.sessionsListInAgendaTemplate = _.template($(sessionTemplates).siblings('#sessionsListInAgenda').html());
        this.agendaSessionsListTemplate = _.template($(sessionTemplates).siblings('#agendaSessionsList').html());
    },

    render: function() {
        var sessions = this.collection,
        agenda = this.options.agenda,
        container = this.options.container,
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
        "click #addRemoveSession": "addRemoveSession",
        "click #removeSession": "removeSession"
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
                $('a[sessionId="'+sessionId+'"]').filter('#addRemoveContribution').find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-g');
                $('a[sessionId="'+sessionId+'"]').filter('#addRemoveContribution').attr('action', 'remove');
            }
        }
        else{
            myAgendaCompleteSessions.remove(sessionInAgenda);
            removeSessionFromAgenda(eventId, sessionId);
            $(e.currentTarget).attr('action', 'add');
            $(e.currentTarget).attr('title', 'Add this session to my agenda');
            $(e.currentTarget).find('.ui-btn-up-g').removeClass('ui-btn-up-g').addClass('ui-btn-up-c');
            $('a[sessionId="'+sessionId+'"]').filter('#addRemoveContribution').find('.ui-btn-up-g').removeClass('ui-btn-up-g').addClass('ui-btn-up-c');
            $('a[sessionId="'+sessionId+'"]').filter('#addRemoveContribution').attr('action', 'add');
            if (isEventInAgenda(eventId)){
                $('#eventHome').remove();
            }
        }

        localStorage.setItem('complete_sessions', JSON.stringify(myAgendaCompleteSessions.toJSON()));

    },

    removeSession: function(e){
        e.preventDefault();
        var eventId = $(e.currentTarget).attr('eventId');
        var sessionId = $(e.currentTarget).attr('sessionId');
        var myAgendaCompleteSessions = loadAgendaCompleteSessions();
        var sessionInAgenda = myAgendaCompleteSessions.find(function(session){
            return session.get('eventId') == eventId &&
            session.get('sessionId') == sessionId;
        });
        myAgendaCompleteSessions.remove(sessionInAgenda);
        removeSessionFromAgenda(eventId, sessionId);
        $(e.currentTarget).parent().remove();

        $('div[id*="speaker_'+eventId+'_"]').remove();
        $('#timetable_'+eventId+'_agenda').remove();
        $('div[id*="timetableDay_'+eventId+'_"]').remove();

        if ($('#sessions_list_'+eventId+'_agenda').find('li').length === 0){

            $('#eventHome').remove();
            $.mobile.changePage('/agenda');
        }



        localStorage.setItem('complete_sessions', JSON.stringify(myAgendaCompleteSessions.toJSON()));
    }

});

var SessionView = Backbone.View.extend({

    initialize: function() {
        var sessionTemplates = getHTMLTemplate('sessions.html');
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
        var dayTemplates = getHTMLTemplate('days.html');
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
        var dayTemplates = getHTMLTemplate('days.html');
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

    tagName: 'ul',

    attributes: {
        'data-role': 'listview',
        'data-inset': 'true'
    },

    initialize: function() {
        var dayTemplates = getHTMLTemplate('contributions.html');
        this.contributionTemplate = _.template($(dayTemplates).siblings('#contribution').html());
        this.contributionInAgendaTemplate = _.template($(dayTemplates).siblings('#contributionInAgenda').html());
        this.agendaContributionTemplate = _.template($(dayTemplates).siblings('#agendaContribution').html());
    },

    render: function() {

        var container = this.options.container,
        contributions = container.data('contributions'),
        create = this.options.create,
        contributionTemplate = this.contributionTemplate,
        agendaContributionTemplate = this.agendaContributionTemplate,
        contributionInAgendaTemplate = this.contributionInAgendaTemplate,
        myAgenda = loadAgendaContributions(),
        agenda = this.options.agenda,
        listView = $(this.el),
        part = container.data('part');

        contributions.comparator = function(contribution){
            return contribution.get('startDate').time;
        };
        contributions.sort();
        var lastTime = "";
        container.data('lastTime');
        var end = false;
        if (part === 0){
            listView.empty();
        }
        for (var i = part; i < contributions.size() && !end; i++) {

            if (i < part + screen.height/50){
                if (container.data('lastTime') === "" ||
                    container.data('lastTime') != contributions.at(i).get('startDate').time){
                        container.data('lastTime', contributions.at(i).get('startDate').time);
                        splittedTime = container.data('lastTime').split(':');
                        listView.append('<li data-role="list-divider">' + splittedTime[0] +'h' + splittedTime[1] + '</li>');
                }
                if(agenda){
                    listView.append(agendaContributionTemplate(contributions.at(i).toJSON()));
                }
                else{
                    var contribInAgenda = myAgenda.find(function(contrib){
                        return contrib.get('eventId') == contributions.at(i).get('eventId') &&
                        contrib.get('contributionId') == contributions.at(i).get('contributionId');
                    });
                    if (contribInAgenda){
                        listView.append(contributionInAgendaTemplate(contributions.at(i).toJSON()));
                    }
                    else{
                        listView.append(contributionTemplate(contributions.at(i).toJSON()));
                    }
                }
            }
            else{
                container.data('part', i);
                end = true;
            }
        }
        if (!end){
            container.data('part', -1);
            container.parent().find('img').hide();
        }
        if (create){
            listView.trigger('create');
            container.append(listView);
            container.trigger('refresh');
            if (!end){
                container.data('part', -1);
            }
            else{
                container.append('<img style="display: block; margin: 0 auto; margin-top: 20px; width: 5%;" src="static/style/images/loading.gif"></img>');
            }
        }
        else{
            listView.listview('refresh');
            if (!end){
                container.data('part', -1);
                container.find('img').hide();
            }
        }
        return this;
    },

    events: {
        "click #addRemoveContribution": "addRemoveContribution",
        "click #removeContribution": "removeContribution"
    },

    addRemoveContribution: function(e){
        e.preventDefault();
        var eventId = $(e.currentTarget).attr('eventId');
        var sessionUniqueId = $(e.currentTarget).attr('sessionUniqueId');
        var sessionId = $(e.currentTarget).attr('sessionId');
        var contributionId = $(e.currentTarget).attr('contributionId');
        var action = $(e.currentTarget).attr('action');
        if (action == 'add'){
            addContributionToAgenda(eventId, sessionUniqueId, contributionId);
            $(e.currentTarget).attr('action', 'remove');
            $(e.currentTarget).attr('title', 'Remove this session from my agenda');
            $(e.currentTarget).find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-g');
        }
        else{
            removeContributionFromAgenda(eventId, sessionUniqueId, contributionId);
            $(e.currentTarget).attr('action', 'add');
            $(e.currentTarget).attr('title', 'Add this session to my agenda');
            $(e.currentTarget).find('.ui-btn-up-g').removeClass('ui-btn-up-g').addClass('ui-btn-up-c');
        }
        $('div[id*="speaker_'+eventId+'_"]').remove();
        $('#timetableDay_'+eventId+'_'+dayDate+'_agenda').remove();
        $('#sessions_'+eventId+'_agenda').remove();
    },

    removeContribution: function(e){
        e.preventDefault();
        var eventId = $(e.currentTarget).attr('eventId');
        var sessionUniqueId = $(e.currentTarget).attr('sessionUniqueId');
        var sessionId = $(e.currentTarget).attr('sessionId');
        var contributionId = $(e.currentTarget).attr('contributionId');
        var dayDate = $(e.currentTarget).attr('dayDate');

        removeContributionFromAgenda(eventId, sessionUniqueId, contributionId);


        var prevEl = $(e.currentTarget).closest('li').prev();
        var nextEl = $(e.currentTarget).closest('li').next();
        if (prevEl.attr('data-role') == 'list-divider' && (nextEl.length === 0 || nextEl.attr('data-role') == 'list-divider')){
            prevEl.remove();
        }
        $(e.currentTarget).closest('li').remove();

        if ($('#sessionDay_list_'+eventId+'_'+sessionId+'_'+dayDate+'_agenda').find('li').length === 0){

            $('a[href="#sessionDay_'+eventId+'_'+sessionId+'_'+dayDate+'_agenda"]').closest('li').remove();

            if($('#session_days_'+eventId+'_'+sessionId+'_agenda').find('li').length === 0){

                $('a[href="#session_'+eventId+'_'+sessionId+'_agenda"]').closest('li').remove();

                if($('#sessions_list_'+eventId+'_agenda').find('li').length === 0){
                    $('#eventHome').remove();
                    $.mobile.changePage('/agenda');
                }
                else{
                    $('div[id*="speaker_'+eventId+'_"]').remove();
                    $('#timetable_'+eventId+'_agenda').remove();
                    $('#timetableDay_'+eventId+'_'+dayDate+'_agenda').remove();
                    $('#sessions_'+eventId+'_agenda').remove();
                    window.location.href='#sessions_'+eventId+'_agenda';
                }
            }
            else{
                $('div[id*="speaker_'+eventId+'_"]').remove();
                $('#timetable_'+eventId+'_agenda').remove();
                $('#timetableDay_'+eventId+'_'+dayDate+'_agenda').remove();
                $('#session_'+eventId+'_'+sessionId+'_agenda').remove();
                window.location.href='#session_'+eventId+'_'+sessionId+'_agenda';
            }
        }
    }

});