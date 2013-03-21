import os
import sys
from indicomobile import app

if __name__ == '__main__':
    if len(sys.argv) == 0:
        config_dir = os.getcwd()
    else:
        config_dir = sys.argv[0]
    app.run(debug=app.config['DEBUG'], host=app.config['HOST'], port=app.config['PORT'])
