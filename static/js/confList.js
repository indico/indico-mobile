$(document).live('pageinit', function(){
    var conferencesContainer = $('#confList'),
    conferencesListView,
    allConferences;
    var confs;
    $.ajax({
        type : "GET",
        url : "/getConfInDB",
        dataType : "json",
        async: false,
        success: function(resp){
            confs=resp;
        }
    });
    allConferences=new Conferences(confs);
    if (confs!=''){
        conferencesListView = new ConferencesListView({
            collection : allConferences,
            viewContainer : conferencesContainer
        });
        conferencesListView.render();
    }


});