import os
import sys
from indicomobile.app import app
from indicomobile.util.json import patch_json
from indicomobile.cache import setup_caching
from indicomobile.server import setup_blueprints
from indicomobile.assets import register_assets

patch_json()


if __name__ == '__main__':
    if len(sys.argv) == 0:
        config_dir = os.getcwd()
    else:
        config_dir = sys.argv[0]
    app.config.from_pyfile('default_settings.cfg')
    setup_caching(app)
    setup_blueprints(app)
    assets = register_assets(app)
    app.run(debug=True, host=app.config['HOST'], port=app.config['PORT'])
