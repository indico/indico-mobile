(function($){
   $.widget('mobile.collapsible_favorite_contrib', $.mobile.collapsible,
            {
                options: {
                    initSelector: ":jqmData(role='collapsible_favorite_contrib')",
                    selected_theme: 'f'
                },
                favorite_theme: function() {
                    var o = this.options;
                    var $el = this.element;

                    var old_theme = 'b';
                    var new_theme = o.selected_theme;
                    var old_btn_class = 'ui-btn-up-' + old_theme;
                    var new_btn_class = 'ui-btn-up-' + new_theme;
                    var old_body_class = 'ui-body-' + old_theme;
                    var new_body_class = 'ui-body-' + new_theme;
                    $el.data('theme', new_theme);
                    $el.attr('data-theme', new_theme);
                    $el.find('[data-theme="' + old_theme + '"]').data('theme', new_theme).attr('data-theme', new_theme);
                    $el.find('.' + old_btn_class).removeClass(old_btn_class).removeClass('ui-btn-hover-' + old_theme).addClass(new_btn_class);
                    $el.find('.' + old_body_class).removeClass(old_body_class).addClass(new_body_class);
                    $el.find('.ui-icon-star').removeClass('ui-icon-star').addClass('ui-icon-delete');
                    $el.data('oldtheme', old_theme);
                    $el.attr('data-oldtheme', old_theme);
                    $el.data('isfavorite-contrib', !($el.data('isfavorite-contrib') || false));
                    $el.attr('data-isfavorite-contrib', !($el.attr('data-isfavorite-contrib') || false));
                },
                switch_theme: function() {
                    var o = this.options;
                    var $el = this.element;

                    var old_theme = $el.attr('data-theme');
                    var new_theme = $el.attr('data-oldtheme') || o.selected_theme;
                    console.log(old_theme + " - " + new_theme)
                    var old_btn_class = 'ui-btn-up-' + old_theme;
                    var new_btn_class = 'ui-btn-up-' + new_theme;
                    var old_body_class = 'ui-body-' + old_theme;
                    var new_body_class = 'ui-body-' + new_theme;
                    $el.attr('data-theme', new_theme);
                    $el.data('theme', new_theme);
                    $el.find('[data-theme="' + old_theme + '"]').data('theme', new_theme).attr('data-theme', new_theme);
                    $el.find('.' + old_btn_class)
                        .removeClass(old_btn_class).removeClass('ui-btn-hover-' + old_theme)
                        .addClass('ui-btn-hover-' + new_theme).addClass(new_btn_class);
                    $el.find('.' + old_body_class).removeClass(old_body_class).addClass(new_body_class);
                    if (old_theme == 'f'){
                        $el.find('.ui-icon-delete').removeClass('ui-icon-delete').addClass('ui-icon-star');
                    }
                    else {
                        $el.find('.ui-icon-star').removeClass('ui-icon-star').addClass('ui-icon-delete');
                    }
                    $el.data('oldtheme', old_theme);
                    $el.attr('data-oldtheme', old_theme);
                    $el.data('isfavorite-contrib', !($el.data('isfavorite-contrib') || false));
                    $el.attr('data-isfavorite-contrib', !($el.attr('data-isfavorite-contrib') || false));
                    $el.trigger('favoritecontrib');
                },
                _create: function() {
                    var $el = this.element;
                    $el.data('collapsible', this);
                    $.mobile.collapsible.prototype._create.call(this);
                    var self = this;
                    this.element.addClass('ui-collapsible-favorite-contrib');
                    var icon = 'star';
                    var theme = 'b'
                    if ($el.data('isfavorite-contrib')) {
                        this.favorite_theme();
                        icon = 'delete';
                        theme = 'f';
                    }
                    $el.find('.ui-btn-inner').
                        append($('<div class="ui-icon ui-icon-' + icon + ' ui-btn-icon-right" href="#"/>').
                               css({'right': '15px', 'left': 'auto'}).click(
                                   function() {
                                       self.switch_theme();
                                       return false;
                                   }));

                }
            });

    $(document).on('create', '.ui-collapsible-set', function(e) {
        return $(":jqmData(role='collapsible_favorite_contrib')", e.target).collapsible_favorite_contrib();
    });
})(jQuery);

(function($){
    $.widget('mobile.collapsible_favorite_session', $.mobile.collapsible,
             {
                 options: {
                     initSelector: ":jqmData(role='collapsible_favorite_session')",
                     selected_theme: 'g'
                 },
                 favorite_theme: function() {
                     var o = this.options;
                     var $el = this.element;

                     var old_theme = 'c';
                     var new_theme = o.selected_theme;
                     var old_btn_class = 'ui-btn-up-' + old_theme;
                     var new_btn_class = 'ui-btn-up-' + new_theme;
                     var old_body_class = 'ui-body-' + old_theme;
                     var new_body_class = 'ui-body-' + new_theme;
                     $el.data('theme', new_theme);
                     $el.attr('data-theme', new_theme);
                     $el.find('[data-theme="' + old_theme + '"]').data('theme', new_theme).attr('data-theme', new_theme);
                     $el.find('.' + old_btn_class).removeClass(old_btn_class).removeClass('ui-btn-hover-' + old_theme).addClass(new_btn_class);
                     $el.find('.' + old_body_class).removeClass(old_body_class).addClass(new_body_class);
                     $el.find('.ui-icon-star').removeClass('ui-icon-star').addClass('ui-icon-delete');
                     $el.data('oldtheme', old_theme);
                     $el.attr('data-oldtheme', old_theme);
                     $el.data('isfavorite-session', !($el.data('isfavorite-session') || false));
                     $el.attr('data-isfavorite-session', !($el.attr('data-isfavorite-session') || false));
                 },
                 switch_theme: function() {
                     var o = this.options;
                     var $el = this.element;
                     var old_theme = $el.attr('data-theme');
                     var new_theme = $el.attr('data-oldtheme') || o.selected_theme;
                     console.log('in session: ' + old_theme + ' - ' + new_theme);
                     var sub_old_theme;
                     var sub_new_theme;
                     if (old_theme == 'g'){
                         $el.find('.ui-icon-delete').removeClass('ui-icon-delete').addClass('ui-icon-star');
                         sub_old_theme = 'f';
                         sub_new_theme = 'b';
                     }
                     else {
                         $el.find('.ui-icon-star').removeClass('ui-icon-star').addClass('ui-icon-delete');
                         sub_old_theme = 'b';
                         sub_new_theme = 'f';
                     }
                     var old_btn_class = 'ui-btn-up-' + old_theme;
                     var new_btn_class = 'ui-btn-up-' + new_theme;
                     var old_body_class = 'ui-body-' + old_theme;
                     var new_body_class = 'ui-body-' + new_theme;
                     $el.data('theme', new_theme);
                     $el.attr('data-theme', new_theme);
                     $el.find('[data-theme="' + old_theme + '"]').data('theme', new_theme).attr('data-theme', new_theme);
                     $el.find('.' + old_btn_class).removeClass(old_btn_class).removeClass('ui-btn-hover-' + old_theme).addClass(new_btn_class);
                     $el.find('.' + old_body_class).removeClass(old_body_class).addClass(new_body_class);
                     var sub_old_btn_class = 'ui-btn-up-' + sub_old_theme;
                     var sub_new_btn_class = 'ui-btn-up-' + sub_new_theme;
                     var sub_old_body_class = 'ui-body-' + sub_old_theme;
                     var sub_new_body_class = 'ui-body-' + sub_new_theme;
                     $el.find('[data-theme="' + sub_old_theme + '"]').data('theme', sub_new_theme).attr('data-theme', sub_new_theme);
                     $el.find('.' + sub_old_btn_class).removeClass(sub_old_btn_class).removeClass('ui-btn-hover-' + old_theme).addClass(sub_new_btn_class);
                     $el.find('.' + sub_old_body_class).removeClass(sub_old_body_class).addClass(sub_new_body_class);
                     $el.data('oldtheme', old_theme);
                     $el.attr('data-oldtheme', old_theme);
                     $el.find('[data-oldtheme='+sub_new_theme+']').data('oldtheme', sub_old_theme).attr('data-oldtheme', sub_old_theme);
                     $el.data('isfavorite-session', !($el.data('isfavorite-session') || false));
                     $el.attr('data-isfavorite-session', !($el.attr('data-isfavorite-session') || false));
                     $el.trigger('favoritesession');
                 },
                 _create: function() {
                     var $el = this.element;
                     $el.data('collapsible', this);
                     $.mobile.collapsible.prototype._create.call(this);
                     var self = this;
                     this.element.addClass('ui-collapsible-favorite-session');
                     var icon = 'star';
                     if ($el.data('isfavorite-session')) {
                         this.favorite_theme();
                         icon = 'delete';
                     }
                     console.log(icon);
                     $el.find('.ui-btn-inner').
                         append($('<div class="ui-icon ui-icon-' + icon + ' ui-btn-icon-right" href="#"/>').
                                css({'right': '15px', 'left': 'auto'}).click(
                                    function() {
                                        self.switch_theme();
                                        return false;
                                    }));

                 }
             });

     $(document).on('create', '.inDay', function(e) {
         return $(":jqmData(role='collapsible_favorite_session')", e.target).collapsible_favorite_session();
     });
 })(jQuery);
