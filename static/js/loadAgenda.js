function loadAgendaContributions(){

    var myAgendaContributions = new Contributions();
    if(localStorage.getItem('contributions')) {
        myAgendaContributions = new Contributions(JSON.parse(localStorage.getItem('contributions')));
    }
    return myAgendaContributions;

}

function loadAgendaSessions(){

    var myAgendaSessions = new Slots();
    if(localStorage.getItem('sessions')) {
        myAgendaSessions = new Slots(JSON.parse(localStorage.getItem('sessions')));
    }
    return myAgendaSessions;

}

function loadAgendaCompleteSessions(){

    var myAgendaCompleteSessions = new Slots();
    if(localStorage.getItem('complete_sessions')) {
        myAgendaCompleteSessions = new Slots(JSON.parse(localStorage.getItem('complete_sessions')));
    }
    return myAgendaCompleteSessions;

}

function loadAgendaEvents(){

    var myAgendaEvents = new Events();
    if(localStorage.getItem('events')) {
        myAgendaEvents = new Events(JSON.parse(localStorage.getItem('events')));
    }
    return myAgendaEvents;

}

function loadHistory(){

    var myHistory = new Events();
    if(localStorage.getItem('myHistory')) {
        myHistory = new Events(JSON.parse(localStorage.getItem('myHistory')));
    }
    return myHistory;

}