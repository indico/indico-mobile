var EventsListView = Backbone.View.extend({
    tagName : 'ul',
    attributes : {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true
    },
    initialize : function() {
        var eventTemplates = getHTMLTemplate('/eventTemplates');
        if ($('#myagenda').length!=0){
            this.template1 = _.template($(eventTemplates).siblings('#agendaEventList').html());
        }else{
            this.template1 = _.template($(eventTemplates).siblings('#eventList').html());
        }
        this.template2 = _.template($(eventTemplates).siblings('#eventListInAgenda').html());
    },
    render: function(){
        var container = this.options.viewContainer,
        events = this.collection,
        template1 = this.template1,
        template2 = this.template2,
        part = this.options.part,
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
                var dateYear = filterDate(event.get('startDate').date)['month']+' '+filterDate(event.get('startDate').date)['year'];
                for (var i=0; i<dates.length; i++){
                    if (dateYear==dates[i]){
                        isAlreadyIn=true;
                    }
                }
                if (!isAlreadyIn){
                    if (event.get('startDate').date!=''){
                        dates[dates.length]=dateYear;
                        listView.append('<li data-role="list-divider">'+dateYear+'</li>');
                    }
                    else{
                        listView.append('<li data-role="list-divider">Date Unknown</li>');
                    }

                }
                if (isEventInAgenda(event.get('id'))){
                    listView.append(template2(event));
                }else{
                    listView.append(template1(event));
                }

            });
            listView.trigger('refresh');
            container.html(listView);
            container.trigger('create');
        }
        else{
            if ($('#myagenda').length!=0){
                container.html('<h4>There is nothing in your agenda</h4>');
            }
            else if ($('#searchHome').length!=0){
                container.html('<h4>Nothing found</h4>');
            }
        }
        return this;

    }
});

getEventInfo = function(eventId){
    var event;
    $.ajax({
        type : "GET",
        url : "/eventInfo",
        dataType : "json",
        async: false,
        data : {
            eventID: eventId
        },
        success: function(resp){
            event=resp;
        }
    });
    return new Event(event);
}

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