var AgendaEventsListView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role': 'listview',
        'data-theme': 'c',
        'data-inset': true
    },

    initialize: function() {
        var eventTemplates = getHTMLTemplate('/eventTemplates');
        this.template1 = _.template($(eventTemplates).siblings('#agendaEventList').html());
    },

    render: function(){
        var container = this.options.viewContainer,
        events = this.collection,
        template1 = this.template1,
        template2 = this.template2,
        listView = $(this.el);

        if (events.size()>0){
            listView.empty();

            events.comparator = function(event){
                return String.fromCharCode.apply(String,
                        _.map(event.get('startDate').date.split(""), function (c) {
                            return 0xffff - c.charCodeAt();
                        })
                    );
            };
            events.sort();

            var dates = [];
            events.each(function(event){
                var isAlreadyIn = false;
                var dateYear = filterDate(event.get('startDate').date).month + ' ' +
                filterDate(event.get('startDate').date).year;
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
                listView.append(template1(event));

            });

            listView.trigger('refresh');
            container.html(listView);
            container.trigger('create');
            }
            else{
                container.html('<h4>There is nothing in your agenda</h4>');
            }
        return this;
    }

});