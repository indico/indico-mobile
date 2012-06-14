var AboutPageView = Backbone.View.extend({
    tagName: 'div',

    attributes: {
        'data-role': 'page'
    },

    initialize: function(){
        var aboutTemplates = getHTMLTemplate('about.html');
        this.aboutTemplate = _.template($(aboutTemplates).siblings('#about').html());
        this.agendaAboutTemplate = _.template($(aboutTemplates).siblings('#agendaAbout').html());
    },

    render: function(){
        var aboutTemplate = this.aboutTemplate,
        agendaAboutTemplate = this.agendaAboutTemplate,
        event = this.options.event,
        agenda = this.options.agenda,
        aboutPage = $(this.el);
        if (agenda){
            aboutPage.attr('id', 'about_' + event.get('id') + '_agenda');
            aboutPage.append(agendaAboutTemplate(event.toJSON()));
        }
        else{
            console.log(event)
            aboutPage.attr('id', 'about_' + event.get('id'));
            aboutPage.append(aboutTemplate(event.toJSON()));
        }
        $('body').append(aboutPage);

        return this;
    }
});