function addToHistory(eventId){
    $.ajax({
        type: "POST",
        url: "/addHistoryEvent/" + eventId + "/"
    });
}

function filterDate(date){

    var newFormat = [];
    var dates = date.split("-");
    var month = ["January", "February", "March", "April",
                 "May", "June", "July", "August",
                 "September", "October", "November", "December"];
    newFormat.year = dates[0];
    newFormat.month = month[dates[1]-1];
    newFormat.day = dates[2];
    return newFormat;

}

function getHTMLTemplate(link) {

    var template;
        $.ajax({
            type: 'GET',
            url: '/static/tpls/' + link,
            async: false,
            success: function(text){
                template = text;
            }
        });
    return template;

}

function hourToText(time){
    var splittedTime = time.split(':');
    return splittedTime[0]+'h'+splittedTime[1];
}