var SpeakersListView = Backbone.View.extend({

    initialize: function(){
        if (this.options.agenda){
            this.speakersListTemplate = _.template($(getHTMLTemplate('speakers.html')).siblings('#agendaSpeakersList').html());
        }
        else{
            this.speakersListTemplate = _.template($(getHTMLTemplate('speakers.html')).siblings('#speakersList').html());
        }
    },

    render: function(){

        var speakers = this.collection,
        container = this.options.container,
        speakersListTemplate = this.speakersListTemplate,
        create = this.options.create;

        if (speakers.size() > 0){
            if (container.data('part') === 0){
                container.empty();
            }
            var end = false;

            speakers.comparator = function(speaker){
                return speaker.get('name');
            };
            speakers.sort();
            for (var i = container.data('part'); i < speakers.size() && !end; i++) {

                if (i < container.data('part') + screen.height/50){

                    if (container.data('firstLetter') === ""){
                        container.data('firstLetter', speakers.at(i).get('name')[0]);
                        container.append('<li data-role="list-divider">' + container.data('firstLetter') + '</li>');
                    }
                    else if(container.data('firstLetter') != speakers.at(i).get('name')[0]){
                        container.data('firstLetter', speakers.at(i).get('name')[0]);
                        container.append('<li data-role="list-divider">' + container.data('firstLetter') + '</li>');
                    }
                    container.append(speakersListTemplate(speakers.at(i).toJSON()));
                }
                else{
                    container.data('part', i);
                    end = true;
                }

            }
            if (!end){
                container.data('part', -1);
                $('.loader').hide();
                container.parent().find('.nouser').hide();
            }
            else{
                container.parent().find('.nouser').hide();
            }
            if (!create){
                container.listview('refresh');
            }
            else{
                container.trigger('create');
            }
        }
        else{
            container.data('part', -1);
            container.empty();
            container.parent().find('.loader').hide();
            if (container.parent().find('.nouser').length === 0){
                container.parent().append('<div class="nouser"><h3>No speaker found.</h3></div>');
            }
            else{
                container.parent().find('.nouser').show();
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
    },

    render: function() {
        var  event = this.options.event,
        speakersPageTemplate = this.speakersPageTemplate,
        agendaSpeakersPageTemplate = this.agendaSpeakersPageTemplate,
        agenda = this.options.agenda,
        pageView = $(this.el);
        if (typeof event.attributes.id === "undefined"){
            event.attributes = event.attributes[0];
        }

        if (agenda){
            pageView.attr('id', 'speakers_' + event.get('id') + '_agenda');
            pageView.append(agendaSpeakersPageTemplate(event.toJSON()));
        }
        else{
            pageView.attr('id', 'speakers_' + event.get('id'));
            pageView.append(speakersPageTemplate(event.toJSON()));
        }
        pageView.trigger('create');
        $('body').append(pageView);
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

            var results;
            $.ajax({
                type: "GET",
                url: "/searchSpeaker/" + eventId,
                dataType: "json",
                data: {
                    search: term
                },
                async: true,
                success: function(resp){
                    results = resp;
                    var resultSpeakers = new Speakers();
                    if (typeof results.length !== "undefined"){
                        resultSpeakers = new Speakers(results);
                    }
                    var container = $('#speakers_list_' + splittedId[1]);
                    if (agenda){
                        container = $('#speakers_list_' + splittedId[1] + '_' + splittedId[2]);
                    }
                    container.data('part', 0);
                    container.data('firstLetter', '');
                    container.data('speakers', resultSpeakers);
                    var speakersListView = new SpeakersListView({
                        collection: resultSpeakers,
                        agenda: agenda,
                        create: false,
                        container: container
                    });
                    speakersListView.render();

                    if (term != '' && term != ' '){
                        for (word in term.split(' ')){
                            container.find('li').highlight(term.split(' ')[word]);
                        }
                    }

                }
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
    },

    render: function() {
        var  speaker = this.options.speaker,
        event = this.options.event,
        speakerPageTemplate = this.speakerPageTemplate,
        agendaSpeakerPageTemplate = this.agendaSpeakerPageTemplate,
        speakerFooterPageTemplate = this.speakerFooterPageTemplate,
        agendaSpeakerFooterPageTemplate = this.agendaSpeakerFooterPageTemplate,
        agenda = this.options.agenda,
        pageView = $(this.el);

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
    },

    render: function(){
        var contributions = this.options.contributions,
        container = this.options.container,
        contributionTemplate = this.contributionTemplate,
        agendaContributionTemplate = this.agendaContributionTemplate,
        contributionInAgendaTemplate = this.contributionInAgendaTemplate,
        agenda = this.options.agenda,
        create = this.options.create,
        myAgenda = loadAgendaContributions(),
        listView = $(this.el);

        console.log(contributions)

        contributions.comparator = function(contribution){
            return [contribution.get('startDate').time, contribution.get('startDate').date];
        };
        contributions.sort();

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
               var contribInAgenda = myAgenda.find(function(contrib){
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
        container.trigger('refresh');

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