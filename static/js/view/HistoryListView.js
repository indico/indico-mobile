var HistoryListView = Backbone.View.extend({

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
        part = this.options.part,
        listView = $(this.el);

        listView.empty();
        events.comparator = function(event){
            return -parseInt(event.get('viewedAt'), 10);
        };
        events.sort();

        var dates = [];
        if (events.size() > 0){
            events.each(function(event){
                var eventInDB = getEvent(event.get('id'));
                event.set('title', eventInDB.get('title'));
                var date = new Date(parseInt(event.get('viewedAt'), 10));
                listView.append('<li data-role="list-divider">' + date + '</li>');
                if (isEventInAgenda(event.get('id'))){
                    listView.append(eventListInAgendaTemplate(event));
                }
                else{
                    listView.append(eventListTemplate(event));
                }
            });
            container.html(listView);
        }
        else{
            container.html('<h4>No history yet.</h4>');
        }
        container.trigger('create');
        return this;
    }

});
