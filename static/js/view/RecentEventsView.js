var RecentEventsView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true
    },

    initialize: function() {
        var eventTemplates = getHTMLTemplate('/eventTemplates');
        this.eventListTemplate = _.template($(eventTemplates).siblings('#eventList').html());
        this.eventListInAgendaTemplate = _.template($(eventTemplates).siblings('#eventListInAgenda').html());
    },

    render: function(){
        var container = this.options.viewContainer,
        events = this.collection,
        eventListTemplate = this.eventListTemplate,
        eventListInAgendaTemplate = this.eventListInAgendaTemplate,
        part = parseInt(this.options.part, 10),
        listView = $(this.el);

        if (events === null){
            container.html('<h3>No future events for the moment.</h3>');
        }
        else {
            events.comparator = function(event){
                return String.fromCharCode.apply(String,
                        _.map(event.get('startDate').date.split(""), function (c) {
                            return 0xffff - c.charCodeAt();
                        })
                );

            };
            events.sort();

            listView.empty();

            var dates = [];
            events.each(function(event){
                var date = event.get('startDate').date;

                var isAlreadyIn = false;
                var dateYear = filterDate(date).month + ' ' + filterDate(date).year;

                for (var i = 0; i < dates.length; i++){
                    if (dateYear == dates[i]){
                        isAlreadyIn = true;
                    }
                }

                if (!isAlreadyIn){
                    if (event.get('date') !== ''){
                        dates[dates.length] = dateYear;
                        listView.append('<li data-role="list-divider">' + dateYear + '</li>');
                    }
                    else{
                        listView.append('<li data-role="list-divider">Date Unknown</li>');
                    }

                }

                var isInAgenda = false;
                if (isEventInAgenda(event.get('id'))){
                    listView.append(eventListInAgendaTemplate(event));
                }
                else{
                    listView.append(eventListTemplate(event));
                }

            });
            container.html(listView);
            container.append('<a data-role="button" id="moreFutureEvents" part="' + (part + 10) + '">more</a>');
        }
        container.trigger('create');
        return this;
    }

});