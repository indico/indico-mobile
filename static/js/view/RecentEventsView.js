
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
                if (isEventInAgenda(event.get('id'))){
                    listView.append(template2(event));
                }
                else{
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

isEventInAgenda = function(eventId){
    var myAgendaContributions = loadAgendaContributions();
    var myAgendaSessions = loadAgendaSessions();

    var contribInAgenda = myAgendaContributions.filter(function(contrib){
        return contrib.get('eventId')==eventId;
    });

    var sessionsInAgenda = myAgendaSessions.filter(function(session){
        return session.get('eventId')==eventId;
    });

    var event = getEventInfo(eventId);

    if (contribInAgenda.length == event.get('numContributions') &&
            sessionsInAgenda.length == event.get('numSessions')){
        if (contribInAgenda.length == 0 && sessionsInAgenda.length==0){
            return false;
        }
        else{
            return true;
        }
    }
    else{
        return false;
    }
};