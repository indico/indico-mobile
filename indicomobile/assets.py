from flask.ext.assets import Environment, Bundle
from indicomobile.app import app

def register_assets(app):

    assets = Environment(app)

    ALL_ASSETS = {
        'core_js': Bundle('js/lib/jquery-1.7.2.js',
                          'js/lib/jquery.highlight-3.js',
                          'js/lib/jquery.mobile-1.1.1.js',
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
        'style_css': Bundle('style/jquery.mobile-1.1.1.css',
                            'style/myStyle.css',
                           output='style/style_css.css')
        }
    assets.debug = app.config["DEBUG"]

    for bundle_id, bundle in ALL_ASSETS.iteritems():
        assets.register(bundle_id, bundle)

    return assets