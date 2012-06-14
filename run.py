import os, sys
from indicomobile.server import app
from indicomobile.util.json import patch_json


patch_json()


if __name__ == '__main__':
    if len(sys.argv) == 0:
        config_dir = os.getcwd()
    else:
        config_dir = sys.argv[0]
    app.config.from_pyfile('default_settings.cfg')
    app.run(debug=True, host=app.config['HOST'], port=app.config['PORT'])
