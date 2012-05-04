var TimetableDaysView = Backbone.View.extend({

    initialize: function() {
        var dayTemplates = getHTMLTemplate('/dayTemplates');
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
        var dayTemplates = getHTMLTemplate('/dayTemplates');
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
                    console.log('append')
                    container.append(timetableDaysListTemplate(session.toJSON()));
                }
            }
        });

        console.log(container);
        container.trigger('create');
        return this;
    }

});


var TimetableDayView = Backbone.View.extend({

    initialize: function() {
        this.dayPageTemplate = _.template($(getHTMLTemplate('/dayTemplates')).siblings('#dayPage').html());
        this.agendaDayPageTemplate = _.template($(getHTMLTemplate('/dayTemplates')).siblings('#agendaDayPage').html());
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
        agenda = this.options.agenda,
        myAgenda = loadAgendaContributions(),
        listView = $(this.el),
        part = container.data('part'),
        padding;

        contributions.comparator = function(contribution){
            return contribution.get('startDate').time;
        };
        contributions.sort();
        var html = "";
        var end = false;
        for (var i = part; i < contributions.size() && !end; i++) {
            if (container.data('lastTime') === ""){
                container.data('lastTime', contributions.at(i).get('startDate').time);
                splittedTime = container.data('lastTime').split(':');
                html = html + '<li data-role="list-divider">' + splittedTime[0] +'h' + splittedTime[1] + '</li>';
                html = html + '<li style="padding-left: 5px !important; padding-right: 5px !important; padding-bottom: 0px !important; padding-top: 0px !important">'+
                              '<div data-role="collapsible-set">';
            }
            else if(container.data('lastTime') != contributions.at(i).get('startDate').time){
                container.data('lastTime', contributions.at(i).get('startDate').time);
                splittedTime = container.data('lastTime').split(':');
                html = html + '</div></li>';
                html = html + '<li data-role="list-divider">' + splittedTime[0] +'h' + splittedTime[1] + '</li>';
                html = html + '<li style="padding-left: 5px !important; padding-right: 5px !important; padding-bottom: 0px !important; padding-top: 0px !important">'+
                              '<div data-role="collapsible-set">';
            }
            if (i < part + 10){
                if(agenda){
                    html = html + agendaContributionTemplate(contributions.at(i).toJSON());
                }
                else{
                    var contribInAgenda = myAgenda.find(function(contrib){
                        return contrib.get('eventId') == contributions.at(i).get('eventId') &&
                        contrib.get('contributionId') == contributions.at(i).get('contributionId');
                    });
                    if (contribInAgenda){
                        html = html + contributionInAgendaTemplate(contributions.at(i).toJSON());
                    }
                    else{
                        html = html + contributionTemplate(contributions.at(i).toJSON());
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
            $('#loading_' + contributions.at(0).get('eventId') + '_' + contributions.at(0).get('dayDate')).hide();
        }
        container.append(html);
        if (create){
            container.trigger('refresh');
        }
        else{
            container.trigger('create');
            container.listview('refresh');
        }
        return this;
    }

});