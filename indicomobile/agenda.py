from flask import Blueprint, json, current_app

agenda = Blueprint('agenda',
                          __name__,
                          template_folder='templates')


@agenda.route('/save', methods=['POST'])
def save():
    mongo.db.users.update({'name': current_app.config['USERNAME']},
                          {'$set': {'agenda': json.loads(request.form['agenda'])}})
    return ''


@agenda.route('/load', methods=['GET'])
def load():
    return json.dumps(mongo.db.users.find({'name': current_app.config['USERNAME']},
                                          {'_id': 0, 'agenda': 1})[0])
