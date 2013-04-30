function addToHistory(eventId){
    $.ajax({
        type: "POST",
        url: BASE_URL + "services/addHistoryEvent/" + eventId + "/"
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
            url: TPL_DIR + link,
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

/*$(document).on( "pageinit", "body", function() {
    $( document ).on( "swipeleft swiperight", "body", function( e ) {
        // We check if there is no open panel on the page because otherwise
        // a swipe to close the left panel would also open the right panel (and v.v.).
        // We do this by checking the data that the framework stores on the page element (panel: open).
        if ( $.mobile.activePage.jqmData("panel") !== "open" ) {
            if ( e.type === "swipeleft"  ) {
                $( "#settings-panel" ).panel( "open" );
            } else if ( e.type === "swiperight" ) {
                $( "#nav-panel" ).panel( "open" );
            }
        }
    });
});*/

$.extend($.expr[':'], {
    'contains': function (elem, i, match, array) {
        return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
    }
});