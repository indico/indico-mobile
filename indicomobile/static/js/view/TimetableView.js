var TimetableDaysView = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('days.html');
        this.timetableDaysTemplate = _.template($(dayTemplates).siblings('#timetableDays').html());
        this.agendaTimetableDaysTemplate = _.template($(dayTemplates).siblings('#agendaTimetableDays').html());
    },
    render: function() {
        var container = this.options.container,
        event = this.options.event,
        create = this.options.create,
        timetableDaysTemplate = this.timetableDaysTemplate,
        agendaTimetableDaysTemplate = this.agendaTimetableDaysTemplate,
        agenda = this.options.agenda;

        if (typeof event.attributes.id === 'undefined'){
            event.attributes = event.attributes[0];
        }
        if (agenda){
            container.append(agendaTimetableDaysTemplate(event.attributes));
        }
        else{
            container.append(timetableDaysTemplate(event.attributes));
        }

        return this;
    }

});

var TimetableDaysListView = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('days.html');
        this.timetableDaysListTemplate = _.template($(dayTemplates).siblings('#timetableDaysList').html());
        this.agendaTimetableDaysListTemplate = _.template($(dayTemplates).siblings('#agendaTimetableDaysList').html());
    },
    render: function() {
        var container = this.options.container,
        sessions = this.options.sessions,
        create = this.options.create,
        timetableDaysListTemplate = this.timetableDaysListTemplate,
        agendaTimetableDaysListTemplate = this.agendaTimetableDaysListTemplate,
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
                    container.append(agendaTimetableDaysListTemplate(session.toJSON()));
                }
                else{
                    container.append(timetableDaysListTemplate(session.toJSON()));
                }
            }
        });

        container.trigger('create');
        return this;
    }

});


var TimetableDayView = Backbone.View.extend({

    initialize: function() {
        this.dayPageTemplate = _.template($(getHTMLTemplate('days.html')).siblings('#dayPage').html());
        this.agendaDayPageTemplate = _.template($(getHTMLTemplate('days.html')).siblings('#agendaDayPage').html());
    },

    render: function() {
        var  day = this.options.day,
        dayPageTemplate = this.dayPageTemplate,
        agendaDayPageTemplate = this.agendaDayPageTemplate,
        agenda = this.options.agenda;

        if (agenda){
            $('body').append(agendaDayPageTemplate(day.toJSON()));
        }
        else{
            $('body').append(dayPageTemplate(day.toJSON()));
        }

        return this;
    }

});

var TimetableDayContributionsView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role': 'listview',
        'data-inset': 'true'
    },

    initialize: function() {
        var contributionsTemplates = getHTMLTemplate('contributions.html');
        this.contributionTemplate = _.template($(contributionsTemplates).siblings('#contribution').html());
        this.contributionInAgendaTemplate = _.template($(contributionsTemplates).siblings('#contributionInAgenda').html());
        this.agendaContributionTemplate = _.template($(contributionsTemplates).siblings('#agendaContribution').html());
        this.agendaPosterTemplate = _.template($(contributionsTemplates).siblings('#agendaPoster').html());
        this.posterTemplate = _.template($(contributionsTemplates).siblings('#poster').html());
        this.posterInAgendaTemplate = _.template($(contributionsTemplates).siblings('#posterInAgenda').html());
    },
    render: function() {
        var container = this.options.container,
        contributions = container.data('contributions'),
        create = this.options.create,
        contributionTemplate = this.contributionTemplate,
        agendaContributionTemplate = this.agendaContributionTemplate,
        contributionInAgendaTemplate = this.contributionInAgendaTemplate,
        agendaPosterTemplate = this.agendaPosterTemplate,
        posterTemplate = this.posterTemplate,
        posterInAgendaTemplate = this.posterInAgendaTemplate,
        agenda = this.options.agenda,
        myAgenda = loadAgendaContributions(),
        listView = $(this.el),
        part = container.data('part');

        contributions.comparator = function(contribution){
            return contribution.get('startDate').time;
        };
        contributions.sort();

        var end = false;
        if (part === 0){
            listView.empty();
        }
        var count = 0;
        for (var i = part; i < contributions.size() && !end; i++) {
            if (count < screen.height/50){
                if (container.data('lastTime') === "" ||
                    container.data('lastTime') != contributions.at(i).get('startDate').time){
                        container.data('lastTime', contributions.at(i).get('startDate').time);
                        splittedTime = container.data('lastTime').split(':');
                        listView.append('<li data-role="list-divider">' + splittedTime[0] +'h' + splittedTime[1] + '</li>');
                }

                if(agenda){
                    if (contributions.at(i).get('isPoster')){
                        if (container.data('lastTime') != container.data('lastPosterTime')){
                            container.data('lastPosterTime', contributions.at(i).get('startDate').time);
                            listView.append(agendaPosterTemplate(contributions.at(i).toJSON()));
                            count++;
                        }
                    }
                    else{
                        listView.append(agendaContributionTemplate(contributions.at(i).toJSON()));
                        count++;
                    }
                }
                else{
                    var contribInAgenda = myAgenda.find(function(contrib){
                        return contrib.get('eventId') == contributions.at(i).get('eventId') &&
                        contrib.get('contributionId') == contributions.at(i).get('contributionId');
                    });
                    if (contribInAgenda){
                        if (contributions.at(i).get('isPoster')){
                            if (container.data('lastTime') != container.data('lastPosterTime')){
                                container.data('lastPosterTime', contributions.at(i).get('startDate').time);
                                listView.append(posterInAgendaTemplate(contributions.at(i).toJSON()));
                                count++;
                            }
                        }
                        else{
                            listView.append(contributionInAgendaTemplate(contributions.at(i).toJSON()));
                            count++;
                        }
                    }
                    else{
                        if (contributions.at(i).get('isPoster')){
                            if (container.data('lastTime') != container.data('lastPosterTime')){
                                container.data('lastPosterTime', contributions.at(i).get('startDate').time);
                                listView.append(posterTemplate(contributions.at(i).toJSON()));
                                count++;
                            }
                        }
                        else{
                            listView.append(contributionTemplate(contributions.at(i).toJSON()));
                            count++;
                        }
                    }
                }
            }
            else{
                container.data('part', i);
                end = true;
            }

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
        "click #removeContribution": "removeContribution",
        "click #addRemoveSession": "addRemoveSession",
        "click #removeSession": "removeSession"
    },

    addRemoveContribution: function(e){
        e.preventDefault();
        var eventId = $(e.currentTarget).attr('eventId');
        var sessionUniqueId = $(e.currentTarget).attr('sessionUniqueId');
        var sessionId = $(e.currentTarget).attr('sessionId');
        var contributionId = $(e.currentTarget).attr('contributionId');
        var dayDate = $(e.currentTarget).attr('dayDate');
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
            $('#sessions_'+eventId).remove();
        }
        $('#sessionDay_'+eventId+'_'+sessionId+'_'+dayDate).remove();
        $('div[id*="speaker_'+eventId+'"]').remove();
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
        $('div[id*="speaker_'+eventId+'"]').remove();
        $('#sessionDay_'+eventId+'_'+sessionId+'_'+dayDate+'_agenda').remove();
        $('#session_'+eventId+'_'+sessionId+'_agenda').remove();
        $('#sessions_'+eventId+'_agenda').remove();

        if ($('#day_list_'+eventId+'_'+dayDate+'_agenda').find('li').length === 0){

            $('#li_'+eventId+'_'+dayDate+'_agenda').remove();

            if($('#timetable_days_'+eventId+'_agenda').find('li').length === 0){

              $('#event_'+eventId+'_agenda').remove();
              $('#eventHome').remove();
              $.mobile.changePage('/agenda');
            }

            else{

                $.mobile.changePage('#timetable_'+eventId+'_agenda');
            }
        }
    },

    addRemoveSession: function(e){
        e.preventDefault();
        var eventId = $(e.currentTarget).attr('eventId');
        var sessionId = $(e.currentTarget).attr('sessionId');
        var dayDate = $(e.currentTarget).attr('dayDate');
        var action = $(e.currentTarget).attr('action');
        var myAgendaContributions = loadAgendaContributions();
        var contributions = new Contributions(getSessionContributions(eventId, sessionId).filter(function(contrib){
            return contrib.get('dayDate') == dayDate;
        }));

        if (action == 'add'){
            for (var i = 0; i < contributions.size()-1; i++){
                myAgendaContributions.add(contributions.at(i));
            }
            localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
            addContributionToAgenda(eventId,
                                    contributions.at(contributions.size()-1).get('sessionUniqueId'),
                                    contributions.at(contributions.size()-1).get('contributionId'));
            $(e.currentTarget).attr('action', 'remove');
            $(e.currentTarget).attr('title', 'Remove this session from my agenda');
            $(e.currentTarget).find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-g');
        }
        else{
            for (var j = 0; j < contributions.size()-1; j++){
                var contribution = myAgendaContributions.find(function(contrib){
                    return contrib.get('eventId') == contributions.at(j).get('eventId') &&
                    contrib.get('contributionId') == contributions.at(j).get('contributionId');
                });
                myAgendaContributions.remove(contribution);
            }
            localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
            removeContributionFromAgenda(eventId,
                                    contributions.at(contributions.size()-1).get('sessionUniqueId'),
                                    contributions.at(contributions.size()-1).get('contributionId'));
            $(e.currentTarget).attr('action', 'add');
            $(e.currentTarget).attr('title', 'Add this session to my agenda');
            $(e.currentTarget).find('.ui-btn-up-g').removeClass('ui-btn-up-g').addClass('ui-btn-up-c');
            if (isEventInAgenda(eventId)){
                $('#eventHome').remove();
            }
        }

        $('#timetableDay_'+eventId+'_'+sessionId+'_'+dayDate).remove();
        $('#sessionDay_'+eventId+'_'+sessionId+'_'+dayDate).remove();
        $('div[id*="speaker_'+eventId+'"]').remove();

    },

    removeSession: function(e){
        e.preventDefault();
        var eventId = $(e.currentTarget).attr('eventId');
        var sessionId = $(e.currentTarget).attr('sessionId');
        var dayDate = $(e.currentTarget).attr('dayDate');
        var myAgendaContributions = loadAgendaContributions();
        var contributions = new Contributions(getSessionContributions(eventId, sessionId).filter(function(contrib){
            return contrib.get('dayDate') == dayDate;
        }));
        for (var i = 0; i < contributions.size()-1; i++){
            var contribution = myAgendaContributions.find(function(contrib){
                return contrib.get('eventId') == contributions.at(i).get('eventId') &&
                contrib.get('contributionId') == contributions.at(i).get('contributionId');
            });
            myAgendaContributions.remove(contribution);
        }
        localStorage.setItem('contributions', JSON.stringify(myAgendaContributions.toJSON()));
        removeContributionFromAgenda(eventId,
                                contributions.at(contributions.size()-1).get('sessionUniqueId'),
                                contributions.at(contributions.size()-1).get('contributionId'));
        var prevEl = $(e.currentTarget).closest('li').prev();
        var nextEl = $(e.currentTarget).closest('li').next();
        if (prevEl.attr('data-role') == 'list-divider' && (nextEl.length === 0 || nextEl.attr('data-role') == 'list-divider')){
            prevEl.remove();
        }
        $(e.currentTarget).closest('li').remove();

        $('div[id*="speaker_'+eventId+'"]').remove();
        $('#sessions_'+eventId+'_agenda').remove();

        if ($('#day_list_'+eventId+'_'+dayDate+'_agenda').find('li').length === 0){
            $('#li_'+eventId+'_'+dayDate+'_agenda').remove();
            if($('#timetable_days_'+eventId+'_agenda').find('li').length === 0){
              $('#timetable_'+eventId+'_agenda').remove();
              $('#event_'+eventId+'_agenda').remove();
              $('#eventHome').remove();
              $.mobile.changePage('/agenda');
            }

            else{

                $.mobile.changePage('#timetable_'+eventId+'_agenda');
            }
        }
    }

});

var ContributionPageView = Backbone.View.extend({

    initialize: function() {
        var contributionsTemplates = getHTMLTemplate('contributions.html');
        this.contributionTemplate = _.template($(contributionsTemplates).siblings('#contributionDetail').html());
        this.agendaContributionTemplate = _.template($(contributionsTemplates).siblings('#agendaContributionDetail').html());
    },
    render: function() {

        var contribution = this.options.contribution,
        agenda = this.options.agenda;

        if (agenda){
            $('body').append(this.agendaContributionTemplate(contribution.toJSON()));
        }
        else{
            $('body').append(this.contributionTemplate(contribution.toJSON()));
        }

        return this;
    }

});