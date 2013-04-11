
function handleError(resp){
    $.mobile.hidePageLoadingMsg();
    if (resp.status == 401){
        alert("You are not authorized or your authorization has expired, please logout and login again.");
    } else {
        alert("An unexpected error has occured.");
    }
}

function addRemoveEventAction(button, collection){
    var eventId = button.attr('eventId');
    var action = button.attr('action');
    var userId = getUserId();
    if (userId != 'null'){
        if (action == 'add'){
            $.ajax({
                type: "GET",
                url: BASE_URL + "addEvent/" + eventId + "/",
                async: false,
                success: function(resp){
                    if (collection !== null){
                        collection.trigger('reload');
                    }
                    else{
                        button.attr('action', 'remove');
                        button.find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-b');
                        $.mobile.hidePageLoadingMsg();
                    }
                },
                error: function(resp){
                    handlerError(resp);
                }
            });
        }
        else{
            $.ajax({
                type: "GET",
                url: BASE_URL + "removeEvent/" + eventId + "/",
                async: false,
                success: function(resp){
                    if (collection !== null){
                        collection.trigger('reload');
                    }
                    else{
                        button.attr('action', 'add');
                        button.find('.ui-btn-up-b').removeClass('ui-btn-up-b').addClass('ui-btn-up-c');
                        $.mobile.hidePageLoadingMsg();
                    }
                },
                error: function(resp){
                    handlerError(resp);
                }
            });
        }
    }
    else{
        alert('Please login first.');
        $.mobile.hidePageLoadingMsg();
    }
}

function addRemoveSessionAction(button, collection){
    var eventId = button.attr('eventId');
    var sessionId = button.attr('sessionId');
    var action = button.attr('action');
    var userId = getUserId();
    if (userId != 'null'){
        if (action == 'add'){
            $.ajax({
                type: "GET",
                url: BASE_URL + "addSession/" + eventId + "/session/" + sessionId + "/",
                async: false,
                success: function(resp){
                    collection.trigger('reload');
                },
                error: function(resp){
                    handlerError(resp);
                }
            });
        }
        else{
            $.ajax({
                type: "GET",
                url: BASE_URL + "removeSession/" + eventId + "/session/" + sessionId + "/",
                async: false,
                success: function(resp){
                    collection.trigger('reload');
                },
                error: function(resp){
                    handlerError(resp);
                }
            });
        }
    }
    else{
        alert('Please login first.');
        $.mobile.hidePageLoadingMsg();
    }

}

function addRemoveContributionAction(button, collection){
    var eventId = button.attr('eventId');
    var contributionId = button.attr('contributionId');
    var action = button.attr('action');
    var userId = getUserId();
    if (userId != 'null'){
        if (action == 'add'){
            $.ajax({
                type: "GET",
                url: BASE_URL + "addContribution/" + eventId + "/contribution/" + contributionId + "/",
                async: false,
                success: function(resp){
                    collection.trigger('reload');
                },
                error: function(resp){
                    handlerError(resp);
                }
            });
        }
        else{
            $.ajax({
                type: "GET",
                url: BASE_URL + "removeContribution/" + eventId + "/contribution/" + contributionId + "/",
                async: false,
                success: function(resp){
                    collection.trigger('reload');
                },
                error: function(resp){
                    handlerError(resp);
                }
            });
        }
    }
    else{
        alert('Please login first.');
        $.mobile.hidePageLoadingMsg();
    }
}