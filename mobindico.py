from flask import Flask
from templatesRoute import templatesRoute
from getEvent import getEvent
from agendaActions import agendaActions
from flask.ext.pymongo import PyMongo

app = Flask(__name__)
app.register_blueprint(templatesRoute)
app.register_blueprint(getEvent)
app.register_blueprint(agendaActions)

app.config.from_pyfile('default_settings.cfg')
app.config['MONGOALCHEMY_DATABASE'] = 'library'

if __name__ == '__main__':
    app.run(debug=True, host="pcuds43.cern.ch")
