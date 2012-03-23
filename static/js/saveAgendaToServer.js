saveAgendaToServer = function(myagenda){
    $.ajax({
        type : "POST",
        url : "/save",
        dataType : "json",
        data : {
            agenda:JSON.stringify(myagenda.toJSON())
        }
    });
}