from flask import Blueprint, render_template, json, session as flask_session

routing = Blueprint('routing',
                    __name__,
                    template_folder='templates')


@routing.route('/')
def index():
    return render_template('index.html')


@routing.route('/agenda/')
def agenda():
    return render_template('agenda.html')


@routing.route('/events/')
def event():
    return render_template('events.html')


@routing.route('/search/')
def search():
    return render_template('search.html')


@routing.route('/now/')
def now():
    return render_template('goingon.html')


@routing.route('/history/')
def history():
    return render_template('history.html')


@routing.route('/forbidden/')
def forbidden():
    return render_template('forbidden.html')

@routing.route('/user_id/', methods=['GET'])
def get_user_id():
    user_id = None
    if 'indico_user' in flask_session:
        user_id = flask_session['indico_user']
    return json.dumps(user_id)