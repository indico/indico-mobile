import os
import sys
from indicomobile import app

if __name__ == '__main__':
    try:
        config_dir = sys.argv[1]
    except IndexError:
        config_dir = os.getcwd()

    app.run(debug=app.config['DEBUG'], host=app.config['SERVER'], port=app.config['SERVER_PORT'])
