var EventDaysView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true
    },

    initialize: function() {
        var dayTemplates = getHTMLTemplate('/dayTemplates');
        this.daysListTemplate = _.template($(dayTemplates).siblings('#daysList').html());
        this.agendaDaysListTemplate = _.template($(dayTemplates).siblings('#agendaDaysList').html());
    },
    render: function() {
        var container = this.options.viewContainer,
        days = this.collection,
        create = this.options.create,
        daysListTemplate = this.daysListTemplate,
        agendaDaysListTemplate = this.agendaDaysListTemplate,
        agenda = this.options.agenda,
        listView = $(this.el);

        $(this.el).empty();

        var hasTimetable = false;

        days.comparator = function(day){
            return day.get('date');
        };
        days.sort();

        days.each(function(day) {
            if (day.get('date')){
                if(agenda){
                    listView.append(agendaDaysListTemplate(day.toJSON()));
                }
                else{
                    listView.append(daysListTemplate(day.toJSON()));
                }
                hasTimetable = true;
            }
        });

        if (!hasTimetable){
            container.html('<h4>No timetable available for this event.</h4>');
        }
        else{
            container.html($(this.el));
            if (create){
                container.trigger('create');
            }
            else{
                container.trigger('refresh');
            }
        }
        return this;
    }

});


var SideDaysView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true
    },

    initialize: function() {
        var dayTemplates = getHTMLTemplate('/dayTemplates');
        this.daysListTemplate = _.template($(dayTemplates).siblings('#daysList').html());
        this.selectedDayTemplate = _.template($(dayTemplates).siblings('#selectedDay').html());
        this.agendaDaysListTemplate = _.template($(dayTemplates).siblings('#agendaDaysList').html());
        this.agendaSelectedDayTemplate = _.template($(dayTemplates).siblings('#agendaSelectedDay').html());
    },
    render: function() {
        var container = this.options.viewContainer,
        date = this.options.date,
        days = this.collection,
        create = this.options.create,
        agenda = this.options.agenda,
        daysListTemplate = this.daysListTemplate,
        selectedDayTemplate = this.selectedDayTemplate,
        agendaDaysListTemplate = this.agendaDaysListTemplate,
        agendaSelectedDayTemplate = this.agendaSelectedDayTemplate,
        listView = $(this.el);

        $(this.el).empty();

        days.comparator = function(day){
            return day.get('date');
        };
        days.sort();

        days.each(function(day) {
            if (day.get('date') == date){
                if (agenda){
                    listView.append(agendaSelectedDayTemplate(day.toJSON()));
                }
                else{
                    listView.append(selectedDayTemplate(day.toJSON()));
                }
            }
            else{
                if (agenda){
                    listView.append(agendaDaysListTemplate(day.toJSON()));
                }
                else{
                    listView.append(daysListTemplate(day.toJSON()));
                }
            }
        });

        container.html($(this.el));

        if (create){
            container.trigger('create');
        }
        else{
            container.trigger('refresh');
        }
        return this;
    }

});
