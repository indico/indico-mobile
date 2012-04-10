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
