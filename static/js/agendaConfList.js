$(document).live('pageinit', function(){
    var conferencesContainer = $('#confList'),
    conferencesListView,
    allConferences;
    var confs;
    $.ajax({
        type : "GET",
        url : "/getConfInAgenda",
        dataType : "json",
        async: false,
        success: function(resp){
            confs=resp;
        }
    });
    console.log(confs);
    allConferences=new Conferences(confs);
    console.log(allConferences);
    if (confs==''){

    }
    else{
        conferencesListView = new ConferencesListView({
            collection : allConferences,
            viewContainer : conferencesContainer
        });
        conferencesListView.render();
    }


});