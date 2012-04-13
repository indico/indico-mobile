var HistoryListView = Backbone.View.extend({
    tagName : 'ul',
    attributes : {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true
    },
    initialize : function() {
        var eventTemplates = getHTMLTemplate('/eventTemplates');
        this.template1 = _.template($(eventTemplates).siblings('#eventList').html());
        this.template2 = _.template($(eventTemplates).siblings('#eventListInAgenda').html());
    },
    render: function(){
        var container = this.options.viewContainer,
        events = this.collection,
        template1 = this.template1,
        template2 = this.template2,
        part = this.options.part,
        listView = $(this.el);

        listView.empty();
        events.comparator = function(event){
            return -parseInt(event.get('viewedAt'));
        };
        events.sort();
        var dates = [];
        if (events.size()>0){
            events.each(function(event){
                var date = new Date(parseInt(event.get('viewedAt')));
                listView.append('<li data-role="list-divider">'+date+'</li>');

                if (isEventInAgenda(event.get('id'))){
                    listView.append(template2(event));
                }
                else{
                    listView.append(template1(event));
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
