var SpeakersListView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role': 'listview',
        'data-inset': 'true'
    },

    initialize: function(){
        this.speakersListTemplate = _.template($(getHTMLTemplate('speakers.html')).siblings('#speakersList').html());
        this.collection.url = this.options.url;
        this.collection.on("reset", this.render, this);
        this.collection.on("hasChanged", this.appendRender, this);
        this.collection.fetch();
        },

    appendRender: function(newitems){
        var self = this,
        container = $(this.options.container),
        speakersListTemplate = this.speakersListTemplate,
        listView = $(this.el),
        term = this.options.term;
        if (newitems[0].length > 0){
            _.each(newitems[0], function(element){
            if (container.data('firstLetter') == '' ||
                    container.data('firstLetter') != element.name[0]){
                    container.data('firstLetter',element.name[0]);
                    listView.append('<li data-role="list-divider">'+element.name[0]+'</li>');
            }
            listView.append(speakersListTemplate(element));
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

    render: function(){

        var speakers = this.collection,
        container = $(this.options.container),
        speakersListTemplate = this.speakersListTemplate,
        create = this.options.create,
        eventId = this.options.eventId,
        listView = $(this.el),
        term = this.options.term;

        this.infiniScroll = new Backbone.InfiniScroll(this.collection, {
          success: function(collection, changed) {
              collection.trigger('hasChanged', [changed]);
          },
          includePage : true});
        this.infiniScroll.enableFetch();

        if (typeof speakers.at(0) !== 'undefined' && typeof speakers.at(0).id !== 'undefined'){
            if (container.data('part') === 0){
                container.empty();
            }
            var end = false;
            speakers.each(function(element){
                if (container.data('firstLetter') == '' ||
                    container.data('firstLetter') != element.get('name')[0]){
                    container.data('firstLetter',element.get('name')[0]);
                    listView.append('<li data-role="list-divider">'+element.get('name')[0]+'</li>');
                }
                listView.append(speakersListTemplate(element.toJSON()));
            });
            container.append(listView);
            container.parent().find('.nouser').hide();
            container.trigger('create');
        }
        else{
            container.parent().find('.loader').hide();
            if (container.parent().find('.nouser').length === 0){
                container.parent().append('<div class="nouser"><h3>No speaker found.</h3></div>');
            }
            else{
                container.parent().find('.nouser').show();
            }
            container.trigger('create');
        }
        if (term != '' && term != ' ' && typeof term !== 'undefined'){
            for (word in term.split(' ')){
                container.find('li').highlight(term.split(' ')[word]);
            }
        }
        return this;
    }

});

var SpeakersPageView = Backbone.View.extend({

    tagName: 'div',

    attributes: {
        'data-role': 'page'
    },

    initialize: function() {
        this.speakersPageTemplate = _.template($(getHTMLTemplate('speakers.html')).siblings('#speakersPage').html());
        this.agendaSpeakersPageTemplate = _.template($(getHTMLTemplate('speakers.html')).siblings('#agendaSpeakersPage').html());
        this.model.url = this.options.url;
        this.model.on('change', this.render, this);
        this.model.fetch();
    },

    render: function() {
        var  event = this.options.model,
        speakersPageTemplate = this.speakersPageTemplate,
        agendaSpeakersPageTemplate = this.agendaSpeakersPageTemplate,
        agenda = this.options.agenda,
        page = this.options.page,
        pageView = $(this.el);

        pageView.attr('id', 'speakers_' + event.get('id'));
        pageView.append(speakersPageTemplate(event.toJSON()));

        pageView.trigger('create');

        $('body').append(pageView);

        $.mobile.changePage(page);

        return this;
    },

    events: {
        'keyup input': 'searchSpeaker'
    },

    searchSpeaker: function(e){

        if (e.keyCode == 13){
            e.preventDefault();
            var splittedId = $(e.currentTarget).attr('id').split('_');
            var eventId = splittedId[1];
            var agenda = false;
            if ($(e.currentTarget).attr('id').split('_').length > 2){
                agenda = true;
            }
            var term = $(e.currentTarget).val();
            var container = $('#speakersContent_' + splittedId[1]);
            container.data('firstLetter', '');
            container.empty();
            var speakersListView = new SpeakersListView({
                collection: new Speakers(),
                url: '/searchSpeaker/'+eventId+'?search='+term,
                eventId: eventId,
                container: '#speakersContent_' + splittedId[1],
                term: term
            });
        }

    }

});

var SpeakerPageView = Backbone.View.extend({

    tagName: 'div',

    attributes: {
        'data-role': 'page',
        'class': 'inDay'
    },

    initialize: function() {
        var speakersTemplate = $(getHTMLTemplate('speakers.html'));
        this.speakerPageTemplate = _.template(speakersTemplate.siblings('#speakerPage').html());
        this.agendaSpeakerPageTemplate = _.template(speakersTemplate.siblings('#agendaSpeakerPage').html());
        this.speakerFooterPageTemplate = _.template(speakersTemplate.siblings('#speakerFooterPage').html());
        this.agendaSpeakerFooterPageTemplate = _.template(speakersTemplate.siblings('#agendaSpeakerFooterPage').html());
        this.options.speaker.url = this.options.speakerUrl;
        this.options.event.url = this.options.eventUrl;
        this.options.speaker.on("change", this.render, this);
        this.options.event.fetch();
        this.options.speaker.fetch();
    },

    render: function() {
        var  speaker = this.options.speaker,
        event = this.options.event,
        speakerPageTemplate = this.speakerPageTemplate,
        agendaSpeakerPageTemplate = this.agendaSpeakerPageTemplate,
        speakerFooterPageTemplate = this.speakerFooterPageTemplate,
        agendaSpeakerFooterPageTemplate = this.agendaSpeakerFooterPageTemplate,
        agenda = this.options.agenda,
        page = this.options.page,
        pageView = $(this.el);

        console.log(speaker)

        if (typeof speaker.attributes.id === "undefined"){
            speaker.attributes = speaker.attributes[0];
        }

        if (agenda){
            pageView.attr('id', 'speaker_'+ speaker.get('eventId') + '_' + speaker.get('id').replace('_',':') + '_agenda');
            pageView.append(agendaSpeakerPageTemplate(speaker.toJSON()));
            pageView.append(agendaSpeakerFooterPageTemplate(event.toJSON()));
        }
        else{
            pageView.attr('id', 'speaker_'+ speaker.get('eventId') + '_' + speaker.get('id').replace('_',':'));
            pageView.append(speakerPageTemplate(speaker.toJSON()));
            pageView.append(speakerFooterPageTemplate(event.toJSON()));
        }

        pageView.trigger('create');
        $('body').append(pageView);

        $.mobile.changePage($(page))

        return this;
    }

});

var SpeakerContributionsView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role': 'listview',
        'data-inset': 'true'
    },

    initialize: function(){
        this.contributionTemplate = _.template($(getHTMLTemplate('contributions.html')).siblings('#contribution').html());
        this.agendaContributionTemplate = _.template($(getHTMLTemplate('contributions.html')).siblings('#agendaContribution').html());
        this.contributionInAgendaTemplate = _.template($(getHTMLTemplate('contributions.html')).siblings('#contributionInAgenda').html());
        this.collection.url = this.options.url;
        this.collection.on("reset", this.render, this);
        this.collection.on("hasChanged",this.appendRender, this);
        this.collection.fetch();
    },

    render: function(){
        var contributions = this.collection,
        container = $(this.options.container),
        contributionTemplate = this.contributionTemplate,
        agendaContributionTemplate = this.agendaContributionTemplate,
        contributionInAgendaTemplate = this.contributionInAgendaTemplate,
        agenda = this.options.agenda,
        create = this.options.create,
        myContributions = myAgenda.getInstance().contributions,
        listView = $(this.el);

        console.log(container)

        var lastDay = "";
        var lastTime = "";
        contributions.each(function(contribution){
           if (lastDay === ""){
               lastDay = contribution.get('startDate').date;
               lastTime = contribution.get('startDate').time;
               splittedTime = lastTime.split(':');
               listView.append('<li data-role="list-divider"><h4>' + lastDay + '</h4></li>');
               listView.append('<li data-role="list-divider">' + splittedTime[0] +'h' + splittedTime[1] + '</li>');
           }
           if (lastTime != contribution.get('startDate').time){
               lastTime = contribution.get('startDate').time;
               splittedTime = lastTime.split(':');
               listView.append('<li data-role="list-divider">' + splittedTime[0] +'h' + splittedTime[1] + '</li>');
           }
           if (agenda){
               listView.append(agendaContributionTemplate(contribution.attributes));
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
        $('#timetableDay_'+eventId+'_'+dayDate).remove();
    },

    removeContribution: function(e){
        e.preventDefault();
        var eventId = $(e.currentTarget).attr('eventId');
        var sessionUniqueId = $(e.currentTarget).attr('sessionUniqueId');
        var sessionId = $(e.currentTarget).attr('sessionId');
        var contributionId = $(e.currentTarget).attr('contributionId');
        var dayDate = $(e.currentTarget).attr('dayDate');
        removeContributionFromAgenda(eventId, sessionUniqueId, contributionId);

        var prevElIsDivider = $(e.currentTarget).closest('li').prev().attr('data-role') == 'list-divider';
        var nextElIsDivider = $(e.currentTarget).closest('li').next().attr('data-role') == 'list-divider';
        var prevPrevElIsDivider = $(e.currentTarget).closest('li').prev().prev().attr('data-role') == 'list-divider';
        var nextNextElIsDivider = $(e.currentTarget).closest('li').next().next().attr('data-role') == 'list-divider';

        if (prevElIsDivider && nextElIsDivider && prevPrevElIsDivider && nextNextElIsDivider){
            $(e.currentTarget).closest('li').prev().remove();
            $(e.currentTarget).closest('li').prev().prev().remove();
        }
        else if (prevElIsDivider && prevPrevElIsDivider &&
                $(e.currentTarget).closest('li').next().length === 0){
            $(e.currentTarget).closest('li').prev().prev().remove();
            $(e.currentTarget).closest('li').prev().remove();
        }
        else if (prevElIsDivider && prevPrevElIsDivider &&
                nextElIsDivider && !nextNextElIsDivider){
            $(e.currentTarget).closest('li').prev().remove();
        }
        else if (prevElIsDivider && !prevPrevElIsDivider &&
                $(e.currentTarget).closest('li').next().length === 0){
            $(e.currentTarget).closest('li').prev().remove();
        }
        else if (prevElIsDivider && !prevPrevElIsDivider &&
                nextElIsDivider && !nextNextElIsDivider){
            $(e.currentTarget).closest('li').prev().remove();
        }

        $(e.currentTarget).closest('li').remove();
        $('#timetableDay_'+eventId+'_'+dayDate+'_agenda').remove();
        $('#sessionDay_'+eventId+'_'+sessionId+'_'+dayDate+'_agenda').remove();
        $('#session_'+eventId+'_'+sessionId+'_agenda').remove();
        $('#sessions_'+eventId+'_agenda').remove();

        if ($.mobile.activePage.find('li').length === 0){

            $('#speakers_'+eventId+'_agenda').remove();
            window.location.href='#speakers_'+eventId+'_agenda';
        }
    }

});