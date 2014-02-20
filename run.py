import os
import inspect
from indicomobile import make_app, main


if 'INDICOMOBILE_CONFIG' in os.environ:
    config = os.environ['INDICOMOBILE_CONFIG']
else:
    current_folder = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
    config = os.path.join(current_folder, 'settings.conf')
    if not os.path.isfile(config):
        raise Exception("Couldn't find config file")

app = make_app(config)
main(app)
