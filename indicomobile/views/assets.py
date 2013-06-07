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
                          'js/lib/moment.js',
                          'js/model/modelsForEvents.js',
                          'js/utils.js',
                          'js/view/PageView.js',
                          'js/view/ListView.js',
                          'js/add_favorites.js',
                          'js/routes.js',
                          filters='rjsmin', output='core_%(version)s.js'),
        'home_js': Bundle('js/home.js',
                          filters='rjsmin', output='home_%(version)s.js'),
        'goingon_js': Bundle('js/goingon.js',
                          filters='rjsmin', output='goingon_%(version)s.js'),
        'events_js': Bundle('js/events.js',
                          filters='rjsmin', output='events_%(version)s.js'),
        'favorites_js': Bundle('js/favorites.js',
                          filters='rjsmin', output='favorites_%(version)ss.js'),
        'history_js': Bundle('js/history.js',
                          filters='rjsmin', output='history_%(version)s.js'),
        'search_js': Bundle('js/search.js',
                          filters='rjsmin', output='search_%(version)s.js'),
        'statistics_js': Bundle('js/statistics.js',
                          filters='rjsmin', output='statistics_%(version)s.js'),
        'maps_js': Bundle('js/lib/gmaps.js',
                          'js/maps.js',
                          filters='rjsmin', output='maps_%(version)s.js'),
        'style_css': Bundle('style/jquery.mobile.css',
                            'style/icons.css',
                            'style/core.css',
                           filters='cssmin', output='style/style_%(version)s.css')
        }
    assets.debug = app.config["DEBUG"]

    for bundle_id, bundle in ALL_ASSETS.iteritems():
        assets.register(bundle_id, bundle)

    return assets