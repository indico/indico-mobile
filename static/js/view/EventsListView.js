var EventsListView = Backbone.View.extend({

    tagName: 'ul',

    attributes: {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true
    },

    initialize: function() {
        var eventTemplates = getHTMLTemplate('/eventTemplates');
        this.template1 = _.template($(eventTemplates).siblings('#eventList').html());
        this.template2 = _.template($(eventTemplates).siblings('#eventListInAgenda').html());
    },

    render: function(){
        var container = this.options.viewContainer,
        events = this.collection,
        template1 = this.template1,
        template2 = this.template2,
        part = parseInt(this.options.part, 10),
        listView = $(this.el);
        console.log(events.size())
        if (events.size() > 0){
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
            for (var i = part; i < (part + 15) && i < events.size() ; i++){
                var isAlreadyIn = false;
                var dateYear = filterDate(events.at(i).get('startDate').date).month +
                ' ' + filterDate(events.at(i).get('startDate').date).year;

                for (var j = 0; j < dates.length; j++){
                    if (dateYear == dates[j]){
                        isAlreadyIn = true;
                    }
                }

                if (!isAlreadyIn){
                    if (events.at(i).get('startDate').date !== ''){
                        dates[dates.length] = dateYear;
                        listView.append('<li data-role="list-divider">' + dateYear + '</li>');
                    }
                    else{
                        listView.append('<li data-role="list-divider">Date Unknown</li>');
                    }

                }

                if (isEventInAgenda(events.at(i).get('id'))){
                    listView.append(template2(events.at(i)));
                }else{
                    listView.append(template1(events.at(i)));
                }
            }
            listView.trigger('refresh');
            container.html(listView);
            if (i < events.size()){
                if (part > 0){
                    container.append('<div data-role="navbar"><ul>'+
                            '<li><a data-role="button" id="moreResults" part="' + (part - 15) + '">Previous</a></li>'+
                            '<li><a data-role="button" id="moreResults" part="' + (part + 15) + '">Next</a></li></ul></div>');
                }
                else{
                    container.append('<div data-role="navbar"><ul><li><a data-role="button" id="moreResults" part="' + (part + 20) + '">Next</a></li></ul></div>');
                }
            }
            else if (events.size()>15){
                container.append('<div data-role="navbar"><ul><li><a data-role="button" id="moreResults" part="' + (part - 20) + '">Previous</a></li></ul></div>');
            }
            container.trigger('create');
        }
        else{
            container.html('<h4>Nothing found</h4>');
            container.trigger('create');
        }
        return this;
    }

});