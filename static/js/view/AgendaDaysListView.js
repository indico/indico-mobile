var AgendaDaysListView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true,
        'data-position': 'fixed'
    },

    initialize: function() {
        var dayTemplates = getHTMLTemplate('/dayTemplates');
        this.template1 = _.template($(dayTemplates).siblings('#agendaDaysList').html());
        this.template2 = _.template($(dayTemplates).siblings('#agendaSelectedDay').html());
    },

    render: function() {
        var container = this.options.viewContainer,
        date = this.options.date,
        days = this.collection,
        template1 = this.template1,
        template2 = this.template2,
        listView = $(this.el);

        if (days.get('title') !== ''){
            $('#headerTitle').html(days.get('title'));
        }
        else{
            $('#headerTitle').html('No title');
        }

        $(this.el).empty();

        var hasTimetable = false;

        if (days.size() === 0){
            hasTimetable = false;
        }

        days.comparator = function(day){
            return day.get('date');
        };
        days.sort();

        days.each(function(day) {
            if (day.get('date')){
                if (day.get('date') == date){
                    listView.append(template2(day.toJSON()));
                    hasTimetable = true;
                }
                else{
                    listView.append(template1(day.toJSON()));
                    hasTimetable = true;
                }
            }
        });

        if (!hasTimetable){
            container.html('<h4>No timetable available for this event.</h4>');
        }
        else{
            container.html($(this.el));
            if (visited){
                container.trigger('create');
            }
            else if (container.attr('id') == 'list'){
                container.trigger('refresh');
            }

            else{
                container.trigger('create');
            }
        }
        return this;
    }

});
