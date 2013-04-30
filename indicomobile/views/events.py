from datetime import timedelta, datetime
from flask import json, Blueprint, Response, abort, session as flask_session, request

from indicomobile import app
import indicomobile.db.session as db_session
import indicomobile.db.event as db_event
import indicomobile.db.contribution as db_contribution
import indicomobile.core.event as event
from indicomobile.core.cache import cache

events = Blueprint('events', __name__, template_folder='templates')

@events.before_request
def with_event(event_id=None):
    """
    Gets executed before every request in this blueprint
    """
    event_id = request.view_args.get('event_id')
    event.update_event_info(event_id)

@events.route('/services/event/<event_id>/days/', methods=['GET'])
def get_event_days(event_id):
    return json.dumps(event.get_event_days(event_id))


@events.route('/services/event/<event_id>/day/<day_date>/', methods=['GET'])
def get_event_day(event_id, day_date):
    return json.dumps(db_event.get_event_day(event_id, day_date))


@events.route('/services/event/<event_id>/session/<session_id>/entries/', methods=['GET'])
def get_event_same_sessions(event_id, session_id):
    return json.dumps(event.get_event_same_sessions(event_id, session_id))

@events.route('/services/event/<event_id>/session/<session_id>/', methods=['GET'])
def get_event_same_session(event_id, session_id):
    return json.dumps(db_session.get_event_same_sessions(event_id, session_id)[0])


@events.route('/services/event/<event_id>/day/<day_date>/session/<session_id>/', methods=['GET'])
def get_event_day_sessions(event_id, session_id, day_date):
    start_date = datetime.strptime(day_date, '%Y-%m-%d')
    end_date = start_date + timedelta(days=1)
    return json.dumps(db_session.get_event_day_session(event_id, session_id, start_date, end_date)[0])


@events.route('/services/event/<event_id>/contrib/<contrib_id>/', methods=['GET'])
def get_event_contribution(event_id, contrib_id):
    return json.dumps(db_contribution.get_contribution(event_id, contrib_id))


@events.route('/services/event/<event_id>/day/<day_date>/contributions/', methods=['GET'])
def get_event_day_contributions(event_id, day_date):
    return json.dumps(event.get_event_day_contributions(event_id, day_date))


@events.route('/services/event/<event_id>/sessions/', methods=['GET'])
def get_event_sessions(event_id):
    return json.dumps(event.get_event_sessions(event_id))


@events.route('/services/event/<event_id>/session/<session_id>/day/<day>/contribs/', methods=['GET'])
def get_session_day_contributions(event_id, session_id, day):
    return json.dumps(event.get_session_day_contributions(event_id, session_id, day))


@events.route('/services/event/<event_id>/speaker/<speaker_id>/contributions/', methods=['GET'])
def get_speaker_contributions(event_id, speaker_id):
    return json.dumps(sorted(event.get_speaker_contributions(event_id, speaker_id)))


@events.route('/services/event/<event_id>/speakers/', methods=['GET'])
def get_event_speakers(event_id):
    return json.dumps(event.get_event_speakers(event_id, int(request.args.get('page', 1))))


@events.route('/services/event/<event_id>/speaker/<speaker_id>/', methods=['GET'])
def get_event_speaker(event_id, speaker_id):
    result = db_event.get_event_speaker(event_id, speaker_id)
    event = db_event.get_event(event_id)
    result["title"] = event["title"]
    return json.dumps(result)


@events.route('/services/event/<event_id>/', methods=['GET'])
def get_event(event_id):
    event = db_event.get_event(event_id)
    if event == None:
        abort(404)
    return json.dumps(event)


@events.route('/services/searchEvent/<search>/', methods=['GET'])
def search_event(search, everything=False):
    return json.dumps(event.search_event(search, everything, int(request.args.get('page', 1))))


@events.route('/services/futureEvents/', methods=['GET'])
def get_future_events():
    return json.dumps(event.get_future_events(int(request.args.get('page', 1))))


@events.route('/services/ongoingEvents/', methods=['GET'])
def get_ongoing_events():
    return Response(json.dumps(event.get_ongoing_events(int(request.args.get('page', 1)))), mimetype='application/json')

@cache.cached(timeout=app.config.get("CACHE_TTL", 3600))
@events.route('/services/ongoingContributions/', methods=['GET'])
def get_ongoing_contributions():
    return json.dumps(event.get_ongoing_contributions())


@events.route('/services/addHistoryEvent/<event_id>/', methods=['POST'])
def add_history_event(event_id):
    if 'indico_user' in flask_session:
        if flask_session['indico_user']:
            user_id = flask_session['indico_user']
            now = datetime.utcnow()
            event_db = db_event.get_event(event_id)
            event_in_history = db_event.get_event_in_history(user_id, event_id)
            if event_in_history:
                db_event.update_event_to_history(event_in_history, now)
            else:
                history_events = list(db_event.get_history(user_id, order=1))
                if len(history_events) > 9:
                    oldest = history_events[0]
                    db_event.remove_event_from_history(user_id, oldest["id"])
                db_event.add_event_to_history(user_id, now, event_db, event_id)
    return json.dumps({'status': 'ok'})


@events.route('/services/historyEvents/', methods=['GET'])
def get_history():
    events_in_history = []
    if 'indico_user' in flask_session:
        if flask_session['indico_user']:
            user_id = flask_session['indico_user']
            events_in_history = list(db_event.get_history(user_id, order=-1))
    return json.dumps(events_in_history)
