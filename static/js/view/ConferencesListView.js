var ConferencesListView = Backbone.View.extend({
    tagName : 'ul',
    attributes : {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true
    },
    initialize : function() {
        var confList;
        $.ajax({
            type: 'GET',
            url: '/confList',
            async:false,
            success: function(text){
                confList = text;
            }
        });
        this.template = _.template(confList);
    },
    render: function(){
        var container = this.options.viewContainer,
        conferences = this.collection,
        template = this.template,
        listView = $(this.el);

        listView.empty();
        conferences.comparator = function(conf){
            return String.fromCharCode.apply(String,
                    _.map(conf.get('date').split(""), function (c) {
                        return 0xffff - c.charCodeAt();
                    })
                );
        };
        conferences.sort();
        var dates = [];
        var count=0;
        var month=new Array("January","February","March","April","May","June","July","August","September","October","November","December");
        conferences.each(function(conf){
            var isAlreadyIn = false;
            var completeDate = new Date(Date.parse(conf.get('date')));
            console.log(completeDate);
            if (completeDate!='Invalid Date'){
                for (var i=0; i<dates.length; i++){
                    if (month[completeDate.getMonth()]+' '+completeDate.getFullYear()==dates[i]){
                        isAlreadyIn=true;
                    }
                }
                if (!isAlreadyIn){
                    if (conf.get('date')!=''){
                        dates[dates.length]=month[completeDate.getMonth()]+' '+completeDate.getFullYear();
                        listView.append('<li data-role="list-divider">'+month[completeDate.getMonth()]+' '+completeDate.getFullYear()+'</li>');
                    }
                    else{
                        listView.append('<li data-role="list-divider">Date Unknown</li>');
                    }

                }
            }

            count++;
            listView.append(template(conf));
        });
        container.html(listView);
        container.trigger('create');
        return this;
    }
});