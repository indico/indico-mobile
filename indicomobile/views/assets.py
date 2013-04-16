from flask.ext.assets import Environment, Bundle

def register_assets(app):

    assets = Environment(app)

    ALL_ASSETS = {
        'core_js': Bundle('js/lib/jquery.js',
                          'js/lib/jquery.highlight.js',
                          'js/lib/jquery.mobile.js',
                          'js/lib/underscore.js',
                          'js/lib/backbone.js',
                          'js/lib/inifiniScroll.js',
                          'js/model/modelsForEvents.js',
                          'js/utils.js',
                          'js/view/PageView.js',
                          'js/view/ListView.js',
                          'js/add_favorites.js',
                          'js/routes.js',
                          output='core_js.js'),
        'home_js': Bundle('js/home.js',
                          output='home_js.js'),
        'goingon_js': Bundle('js/goingon.js',
                          output='goingon_js.js'),
        'events_js': Bundle('js/events.js',
                          output='events_js.js'),
        'agenda_js': Bundle('js/agenda.js',
                          output='agenda_js.js'),
        'history_js': Bundle('js/history.js',
                          output='history_js.js'),
        'search_js': Bundle('js/search.js',
                          output='search_js.js'),
        'maps_js': Bundle('js/lib/gmaps.js',
                          'js/maps.js',
                          output='maps_js.js'),
        'style_css': Bundle('style/jquery.mobile.css',
                            'style/icons.css',
                            'style/core.css',
                           output='style/style_css.css')
        }
    assets.debug = app.config["DEBUG"]

    for bundle_id, bundle in ALL_ASSETS.iteritems():
        assets.register(bundle_id, bundle)

    return assets