
var RecentEventsView = Backbone.View.extend({
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
        listView = $(this.el),
        myAgenda=loadAgenda();

        if (events==null){
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
                var dateYear = filterDate(date)['month']+' '+filterDate(date)['year'];

                for (var i=0; i<dates.length; i++){
                    if (dateYear==dates[i]){
                        isAlreadyIn=true;
                    }
                }

                if (!isAlreadyIn){
                    if (event.get('date')!=''){
                        dates[dates.length]=dateYear;
                        listView.append('<li data-role="list-divider">'+dateYear+'</li>');
                    }
                    else{
                        listView.append('<li data-role="list-divider">Date Unknown</li>');
                    }

                }

                var isInAgenda = false;
                if (myAgenda){
                    var eventInAgenda = myAgenda.find(function(agendaEvent){
                        return agendaEvent.get('id')==event.get('id');
                    });

                    if (eventInAgenda){
                        var eventModel = initEvent(event.get('id'));
                        if (compareEvents(eventInAgenda,eventModel)){
                            listView.append(template2(event));
                            isInAgenda = true;
                        }

                    }
                }

                if (!isInAgenda){
                    listView.append(template1(event));
                }

            });
            container.html(listView);
            container.append('<a data-role="button" id="moreFutureEvents2" part="'+(parseInt(part)+10)+'">more</a>');
        }
        container.trigger('create');
        return this;
    }
});

compareEvents = function(event1, event2){
    var identical=true;
    var days1 = event1.get('days');
    var days2 = event2.get('days');
    if(days1.size()==days2.size()){
        for (var i=0; i<days1.size(); i++){
            var slots1 = days1.at(i).get('slots');
            var slots2 = days2.find(function(day){
                return day.get('date')==days1.at(i).get('date');
            }).get('slots');
            if (slots1.size()==slots2.size()){
                for(var j=0; j<slots1.size(); j++){
                    var contribs1 = slots1.at(j).get('contributions');
                    var contribs2 = slots2.find(function(slot){
                        return slot.get('id')==slots1.at(j).get('id');
                    }).get('contributions');
                    if(contribs1.size()!=contribs2.size()){
                        identical=false;
                    }
                }
            }
            else{
                identical=false;
            }
        }
    }
    else{
        identical=false;
    }

    return identical;
}