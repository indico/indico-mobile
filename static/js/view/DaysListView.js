var EventDaysView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true
    },

    initialize: function() {
        var dayTemplates = getHTMLTemplate('/dayTemplates');
        this.template1 = _.template($(dayTemplates).siblings('#daysList').html());
    },
    render: function() {
        var container = this.options.viewContainer,
        days = this.collection,
        create = this.options.create,
        template1 = this.template1,
        listView = $(this.el);

        $(this.el).empty();

        var hasTimetable = false;

        days.comparator = function(day){
            return day.get('date');
        };
        days.sort();

        days.each(function(day) {
            if (day.get('date')){
                listView.append(template1(day.toJSON()));
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
        this.template1 = _.template($(dayTemplates).siblings('#daysList').html());
        this.template2 = _.template($(dayTemplates).siblings('#selectedDay').html());
    },
    render: function() {
        var container = this.options.viewContainer,
        date = this.options.date,
        days = this.collection,
        create = this.options.create,
        template1 = this.template1,
        template2 = this.template2,
        listView = $(this.el);

        $(this.el).empty();

        days.comparator = function(day){
            return day.get('date');
        };
        days.sort();

        days.each(function(day) {
            if (day.get('date') == date){
                listView.append(template2(day.toJSON()));
            }
            else{
                listView.append(template1(day.toJSON()));
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
