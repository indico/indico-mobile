var AboutPageView = Backbone.View.extend({
    tagName: 'div',

    attributes: {
        'data-role': 'page'
    },

    initialize: function(){
        var aboutTemplates = getHTMLTemplate('about.html');
        this.aboutTemplate = _.template($(aboutTemplates).siblings('#about').html());
        this.agendaAboutTemplate = _.template($(aboutTemplates).siblings('#agendaAbout').html());
        this.model.url = this.options.url;
        this.model.on('change', this.render, this);
        this.model.fetch();
    },

    render: function(){
        var aboutTemplate = this.aboutTemplate,
        agendaAboutTemplate = this.agendaAboutTemplate,
        event = this.model,
        agenda = this.options.agenda,
        page = this.options.page,
        aboutPage = $(this.el);
        if (agenda){
            aboutPage.attr('id', 'about_' + event.get('id') + '_agenda');
            aboutPage.append(agendaAboutTemplate(event.toJSON()));
        }
        else{
            console.log(event.get('id'))
            aboutPage.attr('id', 'about_' + event.get('id'));
            aboutPage.append(aboutTemplate(event.toJSON()));
        }
        console.log(aboutPage)
        $('body').append(aboutPage);

        $.mobile.changePage(page);

        return this;
    }
});