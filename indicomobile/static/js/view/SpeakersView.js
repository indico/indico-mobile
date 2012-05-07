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
        agenda = this.options.agenda
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

//        if (e.keyCode == 13){
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
                    console.log(resultSpeakers);
                    var container = $('#speakers_list_' + splittedId[1]);
                    if (agenda){
                        container = $('#speakers_list_' + splittedId[1] + '_' + splittedId[2]);
                    }
                    container.data('part', 0);
                    container.data('firstLetter', '');
                    container.data('speakers', resultSpeakers);
                    var speakersListView = new SpeakersListView({
                        speakers: resultSpeakers,
                        agenda: agenda,
                        create: false,
                        container: container
                    });
                    speakersListView.render();

                    if($(window).scrollTop() + $(window).height() > container.height() &&
                            container.data('part') != -1) {
                        var speakersListView = new SpeakersListView({
                            speakers: container.data('speakers'),
                            container: container,
                            agenda: agenda,
                            create: false
                        });
                        speakersListView.render();
                    }
                }
            });
//        }

    }

});

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

        var speakers = this.options.speakers,
        container = this.options.container,
        speakersListTemplate = this.speakersListTemplate,
        create = this.options.create;

        if (speakers.size() > 0){
            if (container.data('part') === 0){
                container.empty();
            }

            speakers.comparator = function(speaker){
                return speaker.get('name');
            };
            speakers.sort();
            var end = false;
            for (var i = container.data('part'); i < speakers.size() && !end; i++) {
                if (container.data('firstLetter') === ""){
                    container.data('firstLetter', speakers.at(i).get('name')[0]);
                    container.append('<li data-role="list-divider">' + container.data('firstLetter') + '</li>');
                }
                else if(container.data('firstLetter') != speakers.at(i).get('name')[0]){
                    container.data('firstLetter', speakers.at(i).get('name')[0]);
                    container.append('<li data-role="list-divider">' + container.data('firstLetter') + '</li>');
                }
                if (i < container.data('part') + 10){
                    container.append(speakersListTemplate(speakers.at(i).toJSON()));
                }
                else{
                    container.data('part', i);
                    end = true;
                }

            }
            if (!end){
                container.data('part', -1);
                $('#loadingSpeakers_' + speakers.at(0).get('eventId')).hide();
                container.parent().find('h3').hide();
            }
            else{
                container.parent().find('h4').show();
                container.parent().find('h3').hide();
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
            container.parent().find('h4').hide();
            container.parent().append('<h3>No speaker found.</h3>');
        }

        return this;
    }

});

var SpeakerPageView = Backbone.View.extend({

    tagName: 'div',

    attributes: {
        'data-role': 'page',
        'class': 'inDay'
    },

    initialize: function() {
        this.speakerPageTemplate = _.template($(getHTMLTemplate('speakers.html')).siblings('#speakerPage').html());
        this.agendaSpeakerPageTemplate = _.template($(getHTMLTemplate('speakers.html')).siblings('#agendaSpeakerPage').html());
    },

    render: function() {
        var  speaker = this.options.speaker,
        speakerPageTemplate = this.speakerPageTemplate,
        agendaSpeakerPageTemplate = this.agendaSpeakerPageTemplate,
        agenda = this.options.agenda,
        pageView = $(this.el);

        console.log(speaker);
        if (typeof speaker.attributes.id === "undefined"){
            speaker.attributes = speaker.attributes[0];
        }

        if (agenda){
            pageView.attr('id', 'speaker_'+ speaker.get('eventId') + '_' + speaker.get('id') + '_agenda');
            pageView.append(agendaSpeakerPageTemplate(speaker.attributes));
        }
        else{
            pageView.attr('id', 'speaker_'+ speaker.get('eventId') + '_' + speaker.get('id'));
            pageView.append(speakerPageTemplate(speaker.attributes));
        }

        pageView.trigger('create');
        $('body').append(pageView);
        return this;
    }

});

var SpeakerContributionsView = Backbone.View.extend({

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
        listView = $(this.el);

        contributions.comparator = function(contribution){
            return contribution.get('startDate').date;
        };
        contributions.sort();
        var lastDay = "";
        var html = "";
        contributions.each(function(contribution){
           if (lastDay === ""){
               lastDay = contribution.get('startDate').date;
               html = html + '<li data-role="list-divider"><h2>' + lastDay + '</h2></li>';
               html = html + '<li style="padding-left: 5px !important; padding-right: 5px !important; padding-bottom: 0px !important; padding-top: 0px !important">'+
               '<div data-role="collapsible-set">';
           }
           else if (lastDay != contribution.get('startDate').date){
               lastDay = contribution.get('startDate').date;
               html = html + '</div></li>';
               html = html + '<li data-role="list-divider"><h2>' + lastDay + '</h2></li>';
               html = html + '<li style="padding-left: 5px !important; padding-right: 5px !important; padding-bottom: 0px !important; padding-top: 0px !important">'+
               '<div data-role="collapsible-set">';
           }
           if (agenda){
               html = html + agendaContributionTemplate(contribution.attributes);
           }
           else{
               html = html + contributionTemplate(contribution.attributes);
           }
        });
        container.append(html);
        container.trigger('refresh');

        return this;

    }
});