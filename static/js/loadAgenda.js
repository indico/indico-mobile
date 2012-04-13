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
    var myHistory = new Events();
    if(localStorage.getItem('history')) {
        myHistory = new Events(JSON.parse(localStorage.getItem('history')));
    }
    return myHistory;
}
