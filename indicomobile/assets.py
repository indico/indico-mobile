from flask.ext.assets import Environment, Bundle


def register_assets(app):

    assets = Environment(app)

    ALL_ASSETS = {
        'core_js': Bundle('js/lib/jquery-1.7.2.js',
                          'js/lib/jquery.highlight-3.js',
                          'js/lib/jquery.mobile-1.1.0.min.js',
                          'js/lib/underscore.js',
                          'js/lib/backbone.js',
                          'js/lib/inifiniScroll.js',
                          'js/model/modelsForEvents.js',
                          'js/utils.js',
                          'js/view/PageView.js',
                          'js/view/ListView.js',
                          'js/editAgenda.js',
                          'js/routes.js',
                          output='core_js.js'),
        'style_css': Bundle('style/jquery.mobile-1.1.0.min.css',
                            'style/myStyle.css',
                           output='style/style_css.css')
        }

    for bundle_id, bundle in ALL_ASSETS.iteritems():
        assets.register(bundle_id, bundle)

    return assets