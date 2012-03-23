var DaysListView = Backbone.View.extend({
    tagName : 'ul',
    attributes : {
        'data-role' : 'listview',
        'data-theme': 'c',
        'data-inset': true,
        'data-position': 'fixed'
    },

    initialize : function() {
        this.template1 = _.template(getHTMLTemplate('/daysList'));
        this.template2 = _.template(getHTMLTemplate('/selectedDay'));
    },
    render : function() {
        var container = this.options.viewContainer,
        date = this.options.date,
        conference = this.collection,
        template1 = this.template1,
        template2 = this.template2,
        listView = $(this.el);
        if (conference.get('title')!=''){
            $('#headerTitle').html(conference.get('title'));
        }
        else{

            $('#headerTitle').html('Conference '+conference.get('id'));
        }

        $(this.el).empty();
        conference.get('days').each(function(day) {
            if (day.get('date')){
                if (day.get('date')==date){
                    listView.append(template2(day.toJSON()));
                }
                else{
                    listView.append(template1(day.toJSON()));
                }
            }
        });
        container.html($(this.el));
        if (container.attr('id')=='list'){
            container.trigger('refresh');
        }else{
            container.trigger('create');
        }
        return this;
    }
});
