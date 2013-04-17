function loadFavoritesContributions(){

    var myFavoritesContributions = new Contributions();
    if(localStorage.getItem('contributions')) {
        myFavoritesContributions = new Contributions(JSON.parse(localStorage.getItem('contributions')));
    }
    return myFavoritesContributions;

}

function loadFavoritesSessions(){

    var myFavoritesSessions = new Slots();
    if(localStorage.getItem('sessions')) {
        myFavoritesSessions = new Slots(JSON.parse(localStorage.getItem('sessions')));
    }
    return myFavoritesSessions;

}

function loadFavoritesDays(){

    var myFavoritesDays = new Days();
    if(localStorage.getItem('days')) {
        myFavoritesDays = new Slots(JSON.parse(localStorage.getItem('days')));
    }
    return myFavoritesDays;

}

function loadFavoritesCompleteSessions(){

    var myFavoritesCompleteSessions = new Slots();
    if(localStorage.getItem('complete_sessions')) {
        myFavoritesCompleteSessions = new Slots(JSON.parse(localStorage.getItem('complete_sessions')));
    }
    return myFavoritesCompleteSessions;

}

function loadFavoritesEvents(){

    var myFavoritesEvents = new Events();
    if(localStorage.getItem('events')) {
        myFavoritesEvents = new Events(JSON.parse(localStorage.getItem('events')));
    }
    return myFavoritesEvents;

}