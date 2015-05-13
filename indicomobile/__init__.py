import os
from flask import Flask
from indicomobile.core.cache import setup_caching
from indicomobile.core.session_interface import register_session_interface
from indicomobile.views.assets import register_assets
from indicomobile.views.errors import register_errors
from indicomobile.util.json import patch_json

patch_json()
app = Flask(__name__)


# Patch to set the certificate for SSL Verification
import httplib2


class Http(httplib2.Http):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault('ca_certs', app.config['CERT_FILE'])
        super(Http, self).__init__(*args, **kwargs)

httplib2.Http = Http
# End of path


def setup_blueprints(app):
    from indicomobile.views.routing import routing
    from indicomobile.views.events import events
    from indicomobile.views.favorites import favorites
    from indicomobile.views.authentication import oauth_blueprint
    from indicomobile.views.maps import maps

    app.register_blueprint(routing)
    app.register_blueprint(events)
    app.register_blueprint(favorites)
    app.register_blueprint(oauth_blueprint)
    app.register_blueprint(maps)


def make_app(config_file):
    app.config.from_pyfile(os.path.join(os.getcwd(), config_file))
    app.debug = app.config.get('DEBUG', False)
    setup_caching(app)
    setup_blueprints(app)
    register_assets(app)
    register_errors(app)
    register_session_interface(app)
    return app


def main(application):
    application.run(host=app.config.get('SERVER_HOST', 'localhost'),
                    port=int(app.config.get('SERVER_PORT', 5000)))
