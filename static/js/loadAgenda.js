loadAgenda = function(){
    var myAgenda = null;
    if(localStorage.getItem('agenda')) {
        myAgenda = new Days(JSON.parse(localStorage.getItem('agenda')));
        myAgenda.each(function(event){
            event.set('days', new Days(event.get('days')));
            event.get('days').each(function(day) {
                day.set('slots', new Slots(day.get('slots')));
                day.get('slots').each(function(slot) {
                    var tempContribs = new Contributions();
                    slot.set('contributions', new Contributions(slot.get('contributions')));
                });
            });
        });
    }
    return myAgenda;
}

loadAgendaContributions = function(){
    var myAgendaContributions = new Contributions();
    if(localStorage.getItem('contributions')) {
        myAgendaContributions = new Contributions(JSON.parse(localStorage.getItem('contributions')));
    }
    return myAgendaContributions;
}

loadAgendaSessions = function(){
    var myAgendaSessions = new Slots();
    if(localStorage.getItem('sessions')) {
        myAgendaSessions = new Slots(JSON.parse(localStorage.getItem('sessions')));
    }
    return myAgendaSessions;
}

loadAgendaDays = function(){
    var myAgendaDays = new Days();
    if(localStorage.getItem('days')) {
        myAgendaDays = new Days(JSON.parse(localStorage.getItem('days')));
    }
    return myAgendaDays;
}

loadAgendaEvents = function(){
    var myAgendaEvents = new Events();
    if(localStorage.getItem('events')) {
        myAgendaEvents = new Events(JSON.parse(localStorage.getItem('events')));
    }
    return myAgendaEvents;
}

loadHistory = function(){
    var myHistory = null;
    if(localStorage.getItem('history')) {
        myHistory = new Days(JSON.parse(localStorage.getItem('history')));
        myHistory.each(function(event){
            event.set('days', new Days(event.get('days')));
            event.get('days').each(function(day) {
                day.set('slots', new Slots(day.get('slots')));
                day.get('slots').each(function(slot) {
                    var tempContribs = new Contributions();
                    slot.set('contributions', new Contributions(slot.get('contributions')));
                });
            });
        });
    }
    return myHistory;
}

loadAgendaFromServer = function(){
    var agenda;
    $.ajax({
        type : "GET",
        url : "/load",
        dataType : "json",
        async: false,
        data : {
            name:'claude'
        },
        success: function(resp){
            agenda=resp['agenda'];
        }
    });

    if(agenda) {
        var myAgenda = new Days(agenda);
        myAgenda.each(function(event){
            event.set('days', new Days(event.get('days')));
            event.get('days').each(function(day) {
                day.set('slots', new Slots(day.get('slots')));
                day.get('slots').each(function(slot) {
                    var tempContribs = new Contributions();
                    slot.set('contributions', new Contributions(slot.get('contributions')));
                });
            });
        });
    }
    return myAgenda;
}
