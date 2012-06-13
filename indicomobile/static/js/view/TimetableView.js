var TimetableDaysView = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('days.html');
        this.timetableDaysTemplate = _.template($(dayTemplates).siblings('#timetableDays').html());
        this.agendaTimetableDaysTemplate = _.template($(dayTemplates).siblings('#agendaTimetableDays').html());
        this.model.url = this.options.url;
        this.model.on('change', this.render, this);
        this.model.fetch();
    },
    render: function() {
        var container = this.options.container,
        event = this.options.model,
        create = this.options.create,
        timetableDaysTemplate = this.timetableDaysTemplate,
        agendaTimetableDaysTemplate = this.agendaTimetableDaysTemplate,
        agenda = this.options.agenda,
        page = this.options.page;

        console.log(event)

        if (typeof event.attributes.id === 'undefined'){
            event.attributes = event.attributes[0];
        }
        if (agenda){
            container.append(agendaTimetableDaysTemplate(event.toJSON()));
        }
        else{
            container.append(timetableDaysTemplate(event.toJSON()));
        }

        $.mobile.changePage(page);

        return this;
    }

});

var TimetableDaysListView = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('days.html');
        this.timetableDaysListTemplate = _.template($(dayTemplates).siblings('#timetableDaysList').html());
        this.agendaTimetableDaysListTemplate = _.template($(dayTemplates).siblings('#agendaTimetableDaysList').html());
        this.collection.url = this.options.url;
        this.collection.on("reset", this.render, this);
        this.collection.fetch();
    },
    render: function() {
        var container = $(this.options.container),
        days = this.options.collection,
        create = this.options.create,
        timetableDaysListTemplate = this.timetableDaysListTemplate,
        agendaTimetableDaysListTemplate = this.agendaTimetableDaysListTemplate,
        agenda = this.options.agenda;

        if (days.size() > 0){
            days.each(function(day) {
                if(agenda){
                    container.append(agendaTimetableDaysListTemplate(day.toJSON()));
                }
                else{
                    container.append(timetableDaysListTemplate(day.toJSON()));
                }
            });
        }
        else{
            container.parent().append('<div class="notimetable"><h4>There is no contribution in this event.</h4></div>')
        }
        container.trigger('create');
        container.listview('refresh');
        return this;
    }

});


var TimetableDayView = Backbone.View.extend({

    tagName: 'div',

    attributes: {
        'data-role': 'page'
    },

    initialize: function() {
        var daysTemplate = $(getHTMLTemplate('days.html'));
        this.dayPageTemplate = _.template(daysTemplate.siblings('#dayPage').html());
        this.agendaDayPageTemplate = _.template(daysTemplate.siblings('#agendaDayPage').html());
        this.dayFooterPageTemplate = _.template(daysTemplate.siblings('#dayFooterPage').html());
        this.agendaDayFooterPageTemplate = _.template(daysTemplate.siblings('#agendaDayFooterPage').html());
        this.options.event.url = this.options.eventUrl;
        this.options.day.url = this.options.dayUrl;
        this.options.day.on('change', this.render, this);
        this.options.event.fetch();
        this.options.day.fetch();
    },

    render: function() {
        var  day = this.options.day,
        event = this.options.event,
        dayPageTemplate = this.dayPageTemplate,
        agendaDayPageTemplate = this.agendaDayPageTemplate,
        dayFooterPageTemplate = this.dayFooterPageTemplate,
        agendaDayFooterPageTemplate = this.agendaDayFooterPageTemplate,
        agenda = this.options.agenda,
        page = this.options.page,
        pageView = $(this.el);

        if (agenda){
            pageView.attr('id', 'timetableDay_' + day.get('eventId') + '_' + day.get('date') + '_agenda');
            pageView.append(agendaDayPageTemplate(day.toJSON()));
            pageView.append(agendaDayFooterPageTemplate(event.toJSON()));
        }
        else{
            pageView.attr('id', 'timetableDay_' + day.get('eventId') + '_' + day.get('date'));
            pageView.append(dayPageTemplate(day.toJSON()));
            pageView.append(dayFooterPageTemplate(event.toJSON()));
        }

        $('body').append(pageView);

        $.mobile.changePage(page);

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
            var dayDate = splittedId[2];
            var term = $(e.currentTarget).val();
            var container = $('#day_list_' + splittedId[1] + '_' + splittedId[2]);
            container.empty();
            container.html('<div id="day_list_<%=eventId%>_<%= date %>"><div class="loader"><h4>Loading...</h4><img src="static/style/images/ajax-loader2.gif"/></div></div>');
            container.data('lastTime','');
            container.data('lastPosterTime','');
            var timetableDayContributionsView = new TimetableDayContributionsView({
                container: '#day_list_' + splittedId[1] + '_' + splittedId[2],
                collection: new Contributions(),
                url: 'searchContrib/event/'+eventId+'/day/'+dayDate+'?search='+term,
                term: term
            });
        }

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
        this.collection.url = this.options.url;
        this.collection.on('reset', this.render, this);
        this.collection.on("hasChanged",this.appendRender, this);
        this.collection.fetch();
    },

    render: function() {
        var container = $(this.options.container),
        create = this.options.create,
        contributionTemplate = this.contributionTemplate,
        agendaContributionTemplate = this.agendaContributionTemplate,
        contributionInAgendaTemplate = this.contributionInAgendaTemplate,
        agendaPosterTemplate = this.agendaPosterTemplate,
        posterTemplate = this.posterTemplate,
        posterInAgendaTemplate = this.posterInAgendaTemplate,
        agenda = this.options.agenda,
        myContributions = myAgenda.getInstance().contributions,
        listView = $(this.el),
        term = this.options.term;
        var contributions = this.collection;

        var end = false;
        var count = 0;
        contributions.each(function(contribution){

            if (container.data('lastTime') === "" ||
                container.data('lastTime') != contribution.get('startDate').time){
                    container.data('lastTime', contribution.get('startDate').time);
                    splittedTime = container.data('lastTime').split(':');
                    listView.append('<li data-role="list-divider">' + splittedTime[0] +'h' + splittedTime[1] + '</li>');
            }

            if(agenda){
                if (contribution.get('isPoster')){
                    if (container.data('lastTime') != container.data('lastPosterTime')){
                        container.data('lastPosterTime', contribution.get('startDate').time);
                        listView.append(agendaPosterTemplate(contribution.toJSON()));
                        count++;
                    }
                }
                else{
                    listView.append(agendaContributionTemplate(contribution.toJSON()));
                    count++;
                }
            }
            else{
                var contribInAgenda = myContributions.find(function(contrib){
                    return contrib.get('eventId') == contribution.get('eventId') &&
                    contrib.get('contributionId') == contribution.get('contributionId');
                });
                if (contribInAgenda){
                    if (contribution.get('isPoster')){
                        if (container.data('lastTime') != container.data('lastPosterTime')){
                            container.data('lastPosterTime', contribution.get('startDate').time);
                            listView.append(posterInAgendaTemplate(contribution.toJSON()));
                            count++;
                        }
                    }
                    else{
                        listView.append(contributionInAgendaTemplate(contribution.toJSON()));
                        count++;
                    }
                }
                else{
                    if (contribution.get('isPoster')){
                        if (container.data('lastTime') != container.data('lastPosterTime')){
                            container.data('lastPosterTime', contribution.get('startDate').time);
                            listView.append(posterTemplate(contribution.toJSON()));
                            count++;
                        }
                    }
                    else{
                        listView.append(contributionTemplate(contribution.toJSON()));
                        count++;
                    }
                }
            }
            
        });

        container.append(listView);
        container.trigger('create');
        listView.listview('refresh');
        container.find('.loader').hide();

        if (term != '' && term != ' ' && typeof term !== 'undefined'){
            for (word in term.split(' ')){
                container.find('li').highlight(term.split(' ')[word]);
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
            $(e.currentTarget).find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-b');
        }
        else{
            removeContributionFromAgenda(eventId, sessionUniqueId, contributionId);
            $(e.currentTarget).attr('action', 'add');
            $(e.currentTarget).attr('title', 'Add this session to my agenda');
            $(e.currentTarget).find('.ui-btn-up-b').removeClass('ui-btn-up-b').addClass('ui-btn-up-c');
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
        var myAgendaContributions = myAgenda.getInstance().contributions;
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
            $(e.currentTarget).find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-b');
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
            $(e.currentTarget).find('.ui-btn-up-b').removeClass('ui-btn-up-b').addClass('ui-btn-up-c');
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
        var myAgendaContributions = myAgenda.getInstance().contributions;
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

    tagName: 'div',

    attributes: {
        'data-role': 'page'
    },

    initialize: function() {
        var contributionsTemplates = getHTMLTemplate('contributions.html');
        this.contributionTemplate = _.template($(contributionsTemplates).siblings('#contributionDetail').html());
        this.agendaContributionTemplate = _.template($(contributionsTemplates).siblings('#agendaContributionDetail').html());
        this.contributionFooterTemplate = _.template($(contributionsTemplates).siblings('#contributionFooter').html());
        this.agendaContributionFooterTemplate = _.template($(contributionsTemplates).siblings('#agendaContributionFooter').html());
        this.options.contribution.url = this.options.contributionUrl;
        this.options.event.url = this.options.eventUrl;
        this.options.contribution.on('change', this.render, this);
        this.options.event.fetch();
        this.options.contribution.fetch();
    },
    render: function() {

        var contribution = this.options.contribution,
        event = this.options.event,
        agenda = this.options.agenda
        page = $(this.el),
        link = this.options.page;
        
        page.attr('id', 'contribution_'+event.get('id')+'_'+contribution.get('contributionId'));
        page.append(this.contributionTemplate(contribution.toJSON()));
        page.append(this.contributionFooterTemplate(event.toJSON()));
        console.log(page)
        $('body').append(page);

        $.mobile.changePage(link);
        return this;
    }

});