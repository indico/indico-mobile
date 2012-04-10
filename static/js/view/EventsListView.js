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
        listView = $(this.el),
        myAgenda=loadAgenda();
            if (events.size()>0){

                listView.empty();
                events.comparator = function(event){
                    return String.fromCharCode.apply(String,
                            _.map(event.get('date').split(""), function (c) {
                                return 0xffff - c.charCodeAt();
                            })
                        );
                };
                events.sort();
                var dates = [];
                events.each(function(event){
                    var isAlreadyIn = false;
                    var dateYear = filterDate(event.get('date'))['month']+' '+filterDate(event.get('date'))['year'];
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
                        if (myAgenda){
                            var eventInAgenda = myAgenda.find(function(agendaEvent){
                                return agendaEvent.get('id')==event.get('id');
                            });

                            if (eventInAgenda){
                                var eventModel = initEvent(event.get('id'));
                                if (compareEvents(eventInAgenda,eventModel)){
                                    listView.append(template2(event));
                                }else{
                                    listView.append(template1(event));
                                }

                            }
                            else{
                                listView.append(template1(event));
                            }
                        }
                        else{
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

compareEvents = function(event1, event2){
    var identical=true;
    if (inAgenda){
        var days1 = event1.get('days');
        var days2 = event2.get('days');
        if(days1.size()==days2.size()){
            for (var i=0; i<days1.size(); i++){
                var slots1 = days1.at(i).get('slots');
                var slots2 = days2.at(i).get('slots');
                if (slots1.size()==slots2.size()){
                    for(var j=0; j<slots1.size(); j++){
                        var contribs1 = slots1.at(j).get('contributions');
                        var contribs2 = slots2.at(j).get('contributions');
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
    }else{
        identical=false;
    }


    return identical;
}