from flask import Flask, Blueprint, render_template, json
from flask.ext.pymongo import PyMongo

agendaActions = Blueprint('agendaActions', __name__, template_folder='templates')

@agendaActions.route('/save', methods=['POST'])
def save():
    mongo.db.users.update({'name' : app.config['USERNAME']},{'$set' : {'agenda' : json.loads(request.form['agenda'])}})
    return ''


@agendaActions.route('/load', methods=['GET'])
def load():
    return json.dumps(mongo.db.users.find({'name':app.config['USERNAME']},{'_id':0, 'agenda':1})[0])
