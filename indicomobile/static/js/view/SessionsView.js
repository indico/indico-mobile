var SessionsPageView = Backbone.View.extend({

    initialize: function() {
        var sessionTemplates = getHTMLTemplate('sessions.html');
        this.sessionsPageTemplate = _.template($(sessionTemplates).siblings('#sessionsPage').html());
        this.agendaSessionsPageTemplate = _.template($(sessionTemplates).siblings('#agendaSessionsPage').html());
        this.options.model.url = this.options.url;
        this.options.model.on("change", this.render, this);
        this.options.model.fetch();
    },

    render: function() {
        var event = this.options.model,
        container = this.options.container,
        agenda = this.options.agenda,
        sessionsPageTemplate = this.sessionsPageTemplate,
        agendaSessionsPageTemplate = this.agendaSessionsPageTemplate,
        page = this.options.page;

        if (typeof event.attributes.id === "undefined"){
            event.attributes = event.attributes[0];
        }
        if (agenda){
            container.append(agendaSessionsPageTemplate(event.attributes));
        }
        else{
            container.append(sessionsPageTemplate(event.attributes));
        }

        $.mobile.changePage(page);

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
        this.collection.url = this.options.url;
        this.collection.on("reset", this.render, this);
        this.collection.fetch();
    },

    render: function() {
        var sessions = this.collection,
        agenda = this.options.agenda,
        container = $(this.options.container),
        sessionsListTemplate = this.sessionsListTemplate,
        agendaSessionsListTemplate = this.agendaSessionsListTemplate,
        sessionsListInAgendaTemplate = this.sessionsListInAgendaTemplate,
        listView = $(this.el);

        if(sessions.size() > 0){

            var myAgendaSessions = myAgenda.getInstance().completeSessions;
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
            container.trigger('create');
        }
        else{
            container.append('<h4>There is no session in this event.</h4>')
        }

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
        var myAgendaCompleteSessions = myAgenda.getInstance().completeSessions;
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
                $(e.currentTarget).find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-b');
                $('a[sessionId="'+sessionId+'"]').filter('#addRemoveContribution').find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-g');
                $('a[sessionId="'+sessionId+'"]').filter('#addRemoveContribution').attr('action', 'remove');
            }
        }
        else{
            myAgendaCompleteSessions.remove(sessionInAgenda);
            removeSessionFromAgenda(eventId, sessionId);
            $(e.currentTarget).attr('action', 'add');
            $(e.currentTarget).attr('title', 'Add this session to my agenda');
            $(e.currentTarget).find('.ui-btn-up-b').removeClass('ui-btn-up-b').addClass('ui-btn-up-c');
            $('a[sessionId="'+sessionId+'"]').filter('#addRemoveContribution').find('.ui-btn-up-b').removeClass('ui-btn-up-b').addClass('ui-btn-up-c');
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
        var myAgendaCompleteSessions = myAgenda.getInstance().completeSessions;
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
        this.options.model.url = this.options.url;
        this.options.model.on("change", this.render, this);
        this.options.model.fetch();
    },

    render: function() {
        var session = this.options.model,
        container = this.options.container,
        agenda = this.options.agenda,
        sessionPageTemplate = this.sessionPageTemplate,
        agendaSessionPageTemplate = this.agendaSessionPageTemplate,
        page = this.options.page;
        console.log(session)

        if (typeof session.attributes.id === "undefined"){
            session.attributes = session.attributes[0];
        }
        if (agenda){
            container.append(agendaSessionPageTemplate(session.toJSON()));
        }
        else{
            container.append(sessionPageTemplate(session.toJSON()));
        }

        $.mobile.changePage(page);

        return this;
    }

});

var SessionDaysView = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('days.html');
        this.sessionDaysListTemplate = _.template($(dayTemplates).siblings('#sessionDaysList').html());
        this.agendasessionDaysListTemplate = _.template($(dayTemplates).siblings('#agendaSessionDaysList').html());
        this.collection.url = this.options.url;
        this.collection.on("reset", this.render, this);
        this.collection.fetch();
    },
    render: function() {
        var container = $(this.options.container),
        sessions = this.options.collection,
        create = this.options.create,
        sessionDaysListTemplate = this.sessionDaysListTemplate,
        agendasessionDaysListTemplate = this.agendasessionDaysListTemplate,
        agenda = this.options.agenda;

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
        container.listview('refresh');

        return this;
    }

});

var SessionDayView = Backbone.View.extend({

    tagName: 'div',

    attributes: {
        'data-role': 'page'
    },

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
        agenda = this.options.agenda,
        pageView = $(this.el);

        if (typeof contribution.attributes.eventId === 'undefined'){
            contribution.attributes = contribution.attributes[0];
        }
        if (agenda){
            pageView.attr('id', 'sessionDay_' + contribution.get('eventId') + '_' + contribution.get('sessionId') + '_' + contribution.get('dayDate') + '_agenda');
            pageView.append(agendaSessionDayTemplate(contribution.attributes));
        }
        else{
            pageView.attr('id', 'sessionDay_' + contribution.get('eventId') + '_' + contribution.get('sessionId') + '_' + contribution.get('dayDate'));
            pageView.append(sessionDayTemplate(contribution.attributes));
        }

        container.append(pageView);
        return this;
    },

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
            var container = $('#sessionDay_list_' + splittedId[1] + '_' + splittedId[2] + '_' + splittedId[3]);
            container.empty();
            container.data('lastTime', '');
            var contributionsView = new SessionDayContributions({
                collection: new Contributions(),
                url: 'searchContrib/event/' + eventId + '/session/' + sessionId + '/day/' + dayDate +'?search='+term,
                container: '#sessionDay_list_' + splittedId[1] + '_' + splittedId[2] + '_' + splittedId[3],
                term: term
            });
        }

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
        this.collection.url = this.options.url;
        this.collection.on("reset", this.render, this);
        this.collection.on("hasChanged", this.appendRender, this);
        this.collection.fetch();
    },

    appendRender: function(newitems){
        var self = this,
        container = $(this.options.container),
        contributionTemplate = this.contributionTemplate,
        listView = $(this.el),
        term = this.options.term;
        if (newitems[0].length > 0){
            _.each(newitems[0], function(element){
                if (container.data('lastTime') === "" ||
                    container.data('lastTime') != element.startDate.time){
                    container.data('lastTime', element.startDate.time);
                    splittedTime = container.data('lastTime').split(':');
                    listView.append('<li data-role="list-divider">' + splittedTime[0] +'h' + splittedTime[1] + '</li>');
            }
                listView.append(contributionTemplate(element));
            });
            listView.listview('refresh');

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

    render: function() {

        var container = $(this.options.container),
        contributions = this.collection,
        create = this.options.create,
        contributionTemplate = this.contributionTemplate,
        agendaContributionTemplate = this.agendaContributionTemplate,
        contributionInAgendaTemplate = this.contributionInAgendaTemplate,
        myContributions = myAgenda.getInstance().contributions,
        agenda = this.options.agenda,
        term = this.options.term,
        listView = $(this.el);


        this.infiniScroll = new Backbone.InfiniScroll(this.collection, {
          success: function(collection, changed) {
              collection.trigger('hasChanged', [changed]);
          },
          includePage : true});
        this.infiniScroll.enableFetch();

        var end = false;
        contributions.each(function(contribution){
            if (container.data('lastTime') === "" ||
                container.data('lastTime') != contribution.get('startDate').time){
                    container.data('lastTime', contribution.get('startDate').time);
                    splittedTime = container.data('lastTime').split(':');
                    listView.append('<li data-role="list-divider">' + splittedTime[0] +'h' + splittedTime[1] + '</li>');
            }
            if(agenda){
                listView.append(agendaContributionTemplate(contribution.toJSON()));
            }
            else{
                var contribInAgenda = myContributions.find(function(contrib){
                    return contrib.get('eventId') == contribution.get('eventId') &&
                    contrib.get('contributionId') == contribution.get('contributionId');
                });
                if (contribInAgenda){
                    listView.append(contributionInAgendaTemplate(contribution.toJSON()));
                }
                else{
                    listView.append(contributionTemplate(contribution.toJSON()));
                }
            }
        });

        container.append(listView);
        container.trigger('create');

        if (term != '' && term != ' ' && typeof term !== 'undefined'){
            for (word in term.split(' ')){
                container.find('li').highlight(term.split(' ')[word]);
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
            $(e.currentTarget).find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-b');
        }
        else{
            removeContributionFromAgenda(eventId, sessionUniqueId, contributionId);
            $(e.currentTarget).attr('action', 'add');
            $(e.currentTarget).attr('title', 'Add this session to my agenda');
            $(e.currentTarget).find('.ui-btn-up-b').removeClass('ui-btn-up-b').addClass('ui-btn-up-c');
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
            var myAgendaContributions = myAgenda.getInstance().contributions;
            var isSessionInAgenda = myAgendaContributions.find(function(contrib){
                return contrib.get('eventId') == eventId &&
                contrib.get('sessionId') == sessionId;
            });
            $('a[href="#sessionDay_'+eventId+'_'+sessionId+'_'+dayDate+'_agenda"]').closest('li').remove();

            if(!isSessionInAgenda){
                myAgendaContributions = myAgenda.getInstance().contributions;
                isEventInAgenda = myAgendaContributions.find(function(contrib){
                    return contrib.get('eventId') == eventId;
                });
                $('a[href="#session_'+eventId+'_'+sessionId+'_agenda"]').closest('li').remove();
                if(!isEventInAgenda){
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