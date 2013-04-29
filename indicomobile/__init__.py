import os
from flask import Flask
from indicomobile.core.cache import setup_caching
from indicomobile.views.assets import register_assets
from indicomobile.views.errors import register_errors
from indicomobile.util.json import patch_json

def setup_blueprints(app):
    from indicomobile.views.routing import routing
    from indicomobile.views.events import events
    from indicomobile.views.favorites import favorites
    from indicomobile.views.authentication import oauth_client
    from indicomobile.views.maps import maps

    app.register_blueprint(routing)
    app.register_blueprint(events)
    app.register_blueprint(favorites)
    app.register_blueprint(oauth_client)
    app.register_blueprint(maps)

patch_json()

app = Flask(__name__, instance_path=os.getcwd(),
            instance_relative_config=True)

app.config.from_pyfile('settings.conf')
setup_caching(app)
setup_blueprints(app)
register_assets(app)
register_errors(app)