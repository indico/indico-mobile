
$("[id*=event_]").live('pageinit', function() {
    $("#favorite-toggle").click(function(e) {
        addRemoveEventAction($(e.currentTarget), null);
    });
});

function handlerError(resp){
    $.mobile.hidePageLoadingMsg();
    if (resp.status == 401){
        alert("You are not authorized or your authorization has expired, please logout and login again.");
    } else {
        alert("An unexpected error has occured.");
    }
}

function handlerSuccessAdd(button){
    button.attr('action', 'remove');
    button.find('.ui-btn-up-c').removeClass('ui-btn-up-c').addClass('ui-btn-up-b');
    $.mobile.hidePageLoadingMsg();
}

function handlerSuccessDelete(button){
    button.attr('action', 'add');
    button.find('.ui-btn-up-b').removeClass('ui-btn-up-b').addClass('ui-btn-up-c');
    $.mobile.hidePageLoadingMsg();
}

function addRemoveEventAction(button, collection){
    var eventId = button.attr('eventId');
    var action = button.attr('action');
    var userId = getUserId();
    if (userId != 'null'){
        if (action == 'add'){
            $.ajax({
                type: "POST",
                url: BASE_URL + "services/favorites/addEvent/" + eventId + "/",
                async: false,
                success: function(resp){
                    if (button.hasClass('icon-favorites')) {
                        button.removeClass('icon-favorites').addClass('icon-star-full');
                    }
                    handlerSuccessAdd(button);
                },
                error: function(resp){
                    handlerError(resp);
                }
            });
        }
        else{
            $.ajax({
                type: "POST",
                url: BASE_URL + "services/favorites/removeEvent/" + eventId + "/",
                async: false,
                success: function(resp){
                    if (button.hasClass('icon-star-full')) {
                        button.removeClass('icon-star-full').addClass('icon-favorites');
                    }
                    if(button.find(".ui-btn").data("icon")=="delete") {
                        var element = button.parents("li.ui-btn");
                        var divider = element.prevAll("li.ui-li-divider:first");
                        element.remove();
                        if (divider.next().get(0) === undefined || divider.next().hasClass("ui-li-divider")){
                            divider.remove();
                        }
                    }
                    handlerSuccessDelete(button);
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
                type: "POST",
                url: BASE_URL + "services/favorites/addSession/" + eventId + "/session/" + sessionId + "/",
                async: false,
                success: function(resp){
                    handlerSuccessAdd(button);
                },
                error: function(resp){
                    handlerError(resp);
                }
            });
        }
        else{
            $.ajax({
                type: "POST",
                url: BASE_URL + "services/favorites/removeSession/" + eventId + "/session/" + sessionId + "/",
                async: false,
                success: function(resp){
                    handlerSuccessDelete(button);
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
                type: "POST",
                url: BASE_URL + "services/favorites/addContribution/" + eventId + "/contribution/" + contributionId + "/",
                async: false,
                success: function(resp){
                    handlerSuccessAdd(button);
                },
                error: function(resp){
                    handlerError(resp);
                }
            });
        }
        else{
            $.ajax({
                type: "POST",
                url: BASE_URL + "services/favorites/removeContribution/" + eventId + "/contribution/" + contributionId + "/",
                async: false,
                success: function(resp){
                    handlerSuccessDelete(button);
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