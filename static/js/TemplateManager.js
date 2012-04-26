function getHTMLTemplate(link) {

    var template;
        $.ajax({
            type: 'GET',
            url: link,
            async: false,
            success: function(text){
                template = text;
            }
        });
    return template;

}