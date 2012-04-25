(function($){
    $.widget('mobile.collapsible_favorite', $.mobile.collapsible,
             {
                 options: {
                     initSelector: ":jqmData(role='collapsible_favorite')",
                     selected_theme: 'g'
                 },
                 switch_theme: function() {
                     var o = this.options;
                     var $el = this.element;
                     var old_theme = $el.attr('data-theme');
                     var new_theme;
                     var sub_old_theme;
                     var sub_new_theme;
                     if (old_theme == 'g'){
                         $el.find('.ui-icon-delete').removeClass('ui-icon-delete').addClass('ui-icon-star');
                         $el.find('.ui-favorite-icon-delete').removeClass('ui-favorite-icon-delete').addClass('ui-favorite-icon-star');
                         sub_old_theme = 'f';
                         sub_new_theme = 'b';
                         new_theme = 'c';
                     }
                     else if (old_theme == 'c') {
                         $el.find('.ui-icon-star').removeClass('ui-icon-star').addClass('ui-icon-delete');
                         $el.find('.ui-favorite-icon-star').removeClass('ui-favorite-icon-star').addClass('ui-favorite-icon-delete');
                         sub_old_theme = 'b';
                         sub_new_theme = 'f';
                         new_theme = 'g';
                     }
                     else if (old_theme == 'f') {
                         $el.find('.ui-icon-delete').removeClass('ui-icon-delete').addClass('ui-icon-star');
                         $el.find('.ui-favorite-icon-delete').removeClass('ui-favorite-icon-delete').addClass('ui-favorite-icon-star');
                         sub_old_theme = 'g';
                         sub_new_theme = 'c';
                         new_theme = 'b';
                     }
                     else if (old_theme == 'b') {
                         $el.find('.ui-icon-star').removeClass('ui-icon-star').addClass('ui-icon-delete');
                         $el.find('.ui-favorite-icon-star').removeClass('ui-favorite-icon-star').addClass('ui-favorite-icon-delete');
                         sub_old_theme = 'c';
                         sub_new_theme = 'g';
                         new_theme = 'f';
                     }

                     var sub_old_btn_class = 'ui-btn-up-' + sub_old_theme;
                     var sub_new_btn_class = 'ui-btn-up-' + sub_new_theme;
                     var sub_old_body_class = 'ui-body-' + sub_old_theme;
                     var sub_new_body_class = 'ui-body-' + sub_new_theme;
                     $el.find('[data-theme="' + sub_old_theme + '"]').data('theme', sub_new_theme).attr('data-theme', sub_new_theme);
                     $el.find('.' + sub_old_btn_class).removeClass(sub_old_btn_class).removeClass('ui-btn-hover-' + old_theme).addClass(sub_new_btn_class);
                     $el.find('.' + sub_old_body_class).removeClass(sub_old_body_class).addClass(sub_new_body_class);
                     $el.find('[data-oldtheme='+sub_new_theme+']').data('oldtheme', sub_old_theme).attr('data-oldtheme', sub_old_theme);
                     var old_btn_class = 'ui-btn-up-' + old_theme;
                     var new_btn_class = 'ui-btn-up-' + new_theme;
                     var old_body_class = 'ui-body-' + old_theme;
                     var new_body_class = 'ui-body-' + new_theme;
                     $el.data('theme', new_theme);
                     $el.attr('data-theme', new_theme);
                     $el.find('[data-theme="' + old_theme + '"]').data('theme', new_theme).attr('data-theme', new_theme);
                     $el.find('.' + old_btn_class).removeClass(old_btn_class).removeClass('ui-btn-hover-' + old_theme).addClass(new_btn_class);
                     $el.find('.' + old_body_class).removeClass(old_body_class).addClass(new_body_class);
                     $el.data('oldtheme', old_theme);
                     $el.attr('data-oldtheme', old_theme);
                     $el.data('isfavorite', !($el.data('isfavorite') || false));
                     $el.attr('data-isfavorite', !($el.attr('data-isfavorite') || false));

                 },
                 _create: function() {
                     var $el = this.element;
                     $el.data('collapsible', this);
                     $.mobile.collapsible.prototype._create.call(this);
                     var self = this;
                     this.element.addClass('ui-collapsible-favorite');
                     var theme = this.element.attr('data-theme');
                     var icon = 'star';
                     if ($el.data('isfavorite')) {
                         this.switch_theme();
                         icon = 'delete';
                     }
                     $el.find('.ui-btn-inner').
                         append($('<div class="ui-icon ui-icon-' + icon + ' ui-btn-icon-right ui-favorite-icon-' + icon + '" href="#"/>').
                                css({'right': '15px', 'left': 'auto'}).click(
                                    function() {
                                        self.switch_theme();
                                        if (theme == 'c' || theme == 'g'){
                                            $el.trigger('favoritesession');
                                        }
                                        else{
                                            $el.trigger('favoritecontrib');
                                        }
                                        return false;
                                    }));

                 }
             });

     $(document).on('create', '.inDay', function(e) {
         return $(":jqmData(role='collapsible_favorite')", e.target).collapsible_favorite();
     });
 })(jQuery);
