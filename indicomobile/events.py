import urllib2
import urllib
import httplib
import time
import hashlib
import hmac

from datetime import datetime, timedelta, date
from pytz import timezone, utc
from flask import abort, redirect, request, json, current_app, request, jsonify, render_template, session as flask_session
from indicomobile.db.schema import *
from indicomobile.db.logic import store_event, convert_dates
from indicomobile.util.date_time import dt_from_indico
from indicomobile.cache import cache


events = Blueprint('events', __name__, template_folder='templates')

CACHE_TTL = 3600

def sign_request(path, params, at_key=None, at_secret=None, only_public=False):
    at_key = at_key.encode('ascii')
    at_secret = at_secret.encode('ascii')
    items = params.items() if hasattr(params, 'items') else list(params)
    if at_key:
        items.append(('atk', at_key))
    if only_public:
        items.append(('onlypublic', 'yes'))
    if at_secret:
        items.append(('timestamp', str(int(time.time()))))
        items = sorted(items, key=lambda x: x[0].lower())
        url = '%s?%s' % (path, urllib.urlencode(items))
        signature = hmac.new(at_secret, url, hashlib.sha1).hexdigest()
        items.append(('signature', signature))
    if not items:
        return path
    return '%s?%s' % (path, urllib.urlencode(items))

def get_event_info(event_id):
    url = current_app.config['SERVER_URL'] + \
                                '/export/event/' + event_id + \
                                '.json?ak=' + current_app.config['API_KEY']
    if 'access_token' in flask_session:
        if flask_session['access_token']:
            at_key = flask_session['access_token'].get('key')
            at_secret = flask_session['access_token'].get('secret')
            path = '/export/event/' + event_id + '.json'
            params = {
                'nocache': 'yes'
            }
            url = current_app.config['SERVER_URL'] + sign_request(path, params, at_key, at_secret)

    try:
        f1 = urllib2.urlopen(url)
    except urllib2.HTTPError, err:
        return {'error': err.code}
    f1 = urllib2.urlopen(url)
    event_info = json.loads(f1.read().decode('utf-8'))['results']
    if len(event_info) > 0:
        return event_info[0]
    return {'error': 401}


def fetch_timetable(event_id):
    url = current_app.config['SERVER_URL'] + \
                   '/export/timetable/' + event_id + \
                   '.json?ak=' + \
                   current_app.config['API_KEY']
    if 'access_token' in flask_session:
        if flask_session['access_token']:
            at_key = flask_session['access_token'].get('key')
            at_secret = flask_session['access_token'].get('secret')
            path = '/export/timetable/' + event_id + '.json'
            params = {
                'nocache': 'yes'
            }
            url = current_app.config['SERVER_URL'] + sign_request(path, params, at_key, at_secret)
    f2 = urllib2.urlopen(url)
    return json.loads(f2.read().decode('utf-8'))['results']


@events.before_request
def with_event(event_id=None):
    """
    Gets executed before every request in this blueprint
    """
    event_id = request.view_args.get('event_id')
    if event_id:
        event_http = get_event_info(event_id)
        if not 'error' in event_http:
            event_db = db.Event.find_one({'id': event_id})
            if not event_db:
                event_tt = fetch_timetable(event_id)
                store_event(event_http, event_tt)
            elif utc.localize(event_db['modificationDate']) < dt_from_indico(event_http['modificationDate']):
                Event.cleanup(event_id)
                event_tt = fetch_timetable(event_id)
                store_event(event_http, event_tt)
        else:
            abort(401) 



def update_ongoing_events():
    url = '{0}/export/categ/0.json?ak={1}&from=now&to=now'.format(
            current_app.config['SERVER_URL'], current_app.config['API_KEY'])
    f = urllib2.urlopen(url)
    events = json.loads(f.read().decode('utf-8'))['results']

    for event in events:
        if db.Event.find({'id': event['id']}).count() == 0:
            # store event
            event_tt = fetch_timetable(event['id'])
            store_event(event, event_tt)


def update_future_events():
    url = '{0}/export/categ/0.json?ak={1}&from=1d&limit=50'.format(
        current_app.config['SERVER_URL'], current_app.config['API_KEY'])
    f = urllib2.urlopen(url)
    events = json.loads(f.read().decode('utf-8'))['results']

    for event in events:
        if db.Event.find({'id': event['id']}).count() == 0:
            # store event
            event_tt = fetch_timetable(event['id'])
            store_event(event, event_tt)


@events.route('/event/<event_id>/days/', methods=['GET'])
def eventDays(event_id):
    days = []
    for day in db.Day.find({'conferenceId': event_id}).sort([("date",1)]):
        days.append(day)
    return json.dumps(days)


@events.route('/event/<event_id>/day/<day_date>/', methods=['GET'])
def eventDay(event_id, day_date):
    day = db.Day.find_one({'conferenceId': event_id,
                        'date': day_date})
    return json.dumps(day)


@events.route('/event/<event_id>/session/<session_id>/entries/', methods=['GET'])
def eventSameSessions(event_id, session_id):
    sessionsDB = db.SessionSlot.find({'conferenceId': event_id, 'sessionId': session_id}).sort([('startDate',1)])
    sessions = []
    for session in sessionsDB:
        sessions.append(session)
    return json.dumps(sessions)


@events.route('/event/<event_id>/session/<session_id>/', methods=['GET'])
def eventSameSession(event_id, session_id):
    sessionsDB = db.SessionSlot.find({'conferenceId': event_id, 'sessionId': session_id}).sort([('startDate',1)])
    return json.dumps(sessionsDB[0])


@events.route('/event/<event_id>/day/<day_date>/session/<session_id>/', methods=['GET'])
def eventDaySession(event_id, session_id, day_date):
    start_date = datetime.strptime(day_date, '%Y-%m-%d')
    end_date = start_date + timedelta(days=1)
    sessionsDB = db.SessionSlot.find({'$and':[{'conferenceId': event_id},
                                    {'sessionId': session_id},
                                    {'startDate': {'$gte': start_date}},
                                    {'startDate':{'$lt': end_date}}]}).sort([('startDate',1)])
    return json.dumps(sessionsDB[0])


@events.route('/event/<event_id>/contrib/<contrib_id>/', methods=['GET'])
def eventContribution(event_id, contrib_id):
    contribution = db.Contribution.find_one({'conferenceId': event_id, 'contributionId': contrib_id})
    if contribution['slot']:
        contribution['slot'] = db.dereference(contribution['slot'])
    return json.dumps(contribution)


@events.route('/event/<event_id>/day/<day_date>/contributions/', methods=['GET'])
def dayContributions(event_id, day_date):
    start_date = datetime.strptime(day_date, '%Y-%m-%d')
    end_date = start_date + timedelta(days=1)
    contributions = []
    first_query = db.Contribution.find({'$and':[{'startDate': {'$gte': start_date}},
                                                {'startDate': {'$lt': end_date}},
                                                {'conferenceId': event_id}]}).sort([('startDate',1)])
    for contrib in first_query:
        if contrib['contributionId']:
            if contrib['slot']:
                contrib['slot'] = db.dereference(contrib['slot'])
                contributions.append(contrib)
            else:
                contributions.append(contrib)
    return json.dumps(contributions)


@events.route('/event/<event_id>/sessions/', methods=['GET'])
def eventSessions(event_id):
    sessions = {}
    event = db.Event.find_one({'id': event_id})

    if not event:
        return 'Not found', 400

    slots = db.SessionSlot.find({'conferenceId': event['id']}).sort([('title',1)])

    for slot in slots:
        sessions[slot['sessionId']] = slot

    return json.dumps(sorted(sessions.values(), key=lambda x:x['title']))


@events.route('/event/<event_id>/session/<session_id>/day/<day>/contribs/', methods=['GET'])
def sessionDayContributions(event_id, session_id, day):
    start_date = datetime.strptime(day, '%Y-%m-%d')
    end_date = start_date + timedelta(days=1)
    contributions = []
    session = db.SessionSlot.find({'$and':[{'startDate': {'$gte': start_date}},
                                            {'startDate': {'$lt': end_date}},
                                            {'conferenceId': event_id},
                                            {'sessionId': session_id}]}).sort([('startDate',1)])
    contributions = {}
    for slot in session:
        for contrib in slot['entries']:
            current_contrib = db.dereference(contrib)
            current_contrib['slot'] = slot
            contributions[current_contrib['contributionId']] = current_contrib
    return json.dumps(sorted(contributions.values(), key=lambda x:x['startDate']))


@events.route('/event/<event_id>/speaker/<speaker_id>/contributions/', methods=['GET'])
def speakerContributions(event_id, speaker_id):
    contributions = []
    speaker = db.Presenter.find_one({'id': speaker_id, 'conferenceId': event_id})
    contribs = db.Contribution.find({'$and': [{'presenters': {'$elemMatch': speaker}},
                                    {'conferenceId': event_id}]})
    for contrib in contribs:
        if contrib['slot']:
            contrib['slot'] = db.dereference(contrib['slot'])
        contributions.append(contrib)
    return json.dumps(sorted(contributions, key=lambda x:x['startDate']))


@events.route('/event/<event_id>/speakers/', methods=['GET'])
def eventSpeakers(event_id):
    pageNumber = int(request.args.get('page',1))
    speakers = []
    # speakers_DB = Speaker.query.filter(Speaker.eventId == event_id).skip((pageNumber - 1) * 20).limit(20)
    contributions = db.Contribution.find({'conferenceId': event_id})
    for contrib in contributions:
        for speaker in contrib['presenters']:
            if not speaker in speakers:
                speakers.append(speaker)
    first_element = (pageNumber-1)*20
    return json.dumps(sorted(speakers, key=lambda x:x['name'])[first_element:first_element+20])


@events.route('/event/<event_id>/speaker/<speaker_id>/', methods=['GET'])
def eventSpeaker(event_id, speaker_id):
    speaker = db.Presenter.find_one({'id': speaker_id})
    return json.dumps(speaker)


@events.route('/event/<event_id>/', methods=['GET'])
def eventInfo(event_id):
    event_db = db.Event.find_one({'id': event_id})
    return json.dumps(event_db)


@events.route('/searchEvent/<search>/', methods=['GET'])
def search_event(search, everything=False):
    search = urllib.quote(search)
    pageNumber = int(request.args.get('page',1))
    url = current_app.config['SERVER_URL'] + \
              '/export/event/search/' + search + \
              '.json?ak=' + \
              current_app.config['API_KEY']
    if 'access_token' in flask_session:
        if flask_session['access_token']:
            at_key = flask_session['access_token'].get('key')
            at_secret = flask_session['access_token'].get('secret')
            path = '/export/event/search/' + search + '.json'
            params = {
                'nocache': 'yes'
            }
            url = current_app.config['SERVER_URL'] + sign_request(path, params, at_key, at_secret)
    req = urllib2.Request(url)
    opener = urllib2.build_opener()
    try:
        f = opener.open(req)
    except urllib2.HTTPError, err:
        return json.dumps({'error': err.code})
    results = json.load(f)['results']
    results= sorted(results,
                    key=lambda k: datetime.combine(datetime.strptime(k['startDate']['date'], "%Y-%m-%d"),
                         datetime.strptime(k['startDate']['time'], "%H:%M:%S").time()))
    results.reverse()
    first_element = (pageNumber-1)*20
    if everything:
        return json.dumps(results)
    return json.dumps(results[first_element:first_element+20])


@events.route('/searchSpeaker/event/<event_id>/search/<search>/', methods=['GET'])
def search_speaker(event_id, search):
    search = urllib.quote(search)
    pageNumber = int(request.args.get('page',1))
    offset = int(request.args.get('offset', 20))
    words = search.split('%20')
    regex = ''
    for word in words:
        regex += '(?=.*' + word + ')'
    speakers = db.Presenter.find({'name': {'$regex': regex, '$options': 'i'},
                                'conferenceId': event_id}).sort([('name', 1)]).skip((pageNumber-1)*offset).limit(offset)
    return json.dumps(list(speakers))


def generic_search_contrib(search, event_id, day_date, session_id):
    start_date = datetime.strptime(day_date, '%Y-%m-%d')
    end_date = start_date + timedelta(days=1)
    words = search.split('%20')
    regex = ''
    for word in words:
        regex += '(?=.*' + word + ')'
    contributions = []
    results = db.Contribution.find({'$and':[{'title': {'$regex': regex, '$options': 'i'}},
                                        {'conferenceId': event_id},
                                        {'startDate': {'$gte': start_date}},
                                        {'startDate': {'$lt': end_date}}]}).sort([('startDate',1)])
    for contrib in results:
        if contrib['slot']:
            contrib['slot'] = db.dereference(contrib['slot'])
            if session_id:
                if contrib['slot']['sessionId'] == session_id:
                    contributions.append(contrib)
            else:
                contributions.append(contrib)
        elif not session_id:
            contributions.append(contrib)
    return json.dumps(contributions)


@events.route('/searchContrib/event/<event_id>/day/<day_date>/search/<search>/', methods=['GET'])
def search_contrib(event_id, day_date, search):
    return generic_search_contrib(search, event_id, day_date, None)


@events.route('/searchContrib/event/<event_id>/session/<session_id>/day/<day_date>/search/<search>/', methods=['GET'])
def search_contrib_in_session(event_id, session_id, day_date, search):
    return generic_search_contrib(search, event_id, day_date, session_id)


@events.route('/futureEvents/', methods=['GET'])
@cache.cached(timeout=CACHE_TTL)
def getFutureEvents():
    update_future_events()
    tomorrow = datetime.utcnow() + timedelta(days=1)
    future_events = list(db.Event.find({'startDate': {'$gt': tomorrow},
                                        'hasAnyProtection': False}).sort([('startDate',1)]).sort('startDate',-1).limit(15))
    return json.dumps(future_events)


@events.route('/ongoingEvents/', methods=['GET'])
@cache.cached(timeout=CACHE_TTL)
def getOngoingEvents():
    update_ongoing_events()
    now = datetime.utcnow()
    ongoing_events = list(db.Event.find({'$and':[{'startDate' :{'$lte': now}},
                                        {'hasAnyProtection': False},
                                        {'endDate': {'$gte': now}}]}).sort('startDate',-1).limit(15))
    return json.dumps(ongoing_events)


@events.route('/ongoingContributions/', methods=['GET'])
@cache.cached(timeout=CACHE_TTL)
def getOngoingContributions():
    update_ongoing_events()
    now = datetime.utcnow()
    tomorrow = now + timedelta(hours=6)
    results = []
    ongoing_contributions = list(db.Contribution.find({'$and':[{'startDate' :{'$gte': now}},
                                    {'startDate' :{'$lt': tomorrow}},
                                    {'hasAnyProtection': False},
                                    {'_fossil': 'contribSchEntryDisplay'}]}).sort([('startDate',1)]))

    results = list(db.Event.find({'$and':[{'startDate' :{'$gte': now}},
                                    {'startDate' :{'$lt': tomorrow}},
                                    {'type': 'simple_event'}]}).sort([('startDate',1)]))
    for contribution in ongoing_contributions:
        if contribution['slot']:
            contribution['slot'] = db.dereference(contribution['slot'])
        results.append(contribution)
    return json.dumps(sorted(results, key=lambda x:x['startDate']))


@events.route('/map/location/CERN/room/<room_name>/', methods=['GET'])
def get_map(room_name):
    room_name = urllib.quote(room_name)
    
    url = current_app.config['SERVER_URL'] + '/export/roomName/CERN/' + room_name + '.json?ak=' + current_app.config['API_KEY']
    req = urllib2.Request(url)
    opener = urllib2.build_opener()
    f = opener.open(req)
    results = json.load(f)['results']
    if len(results) > 0:
        results = results[0]
    else:
        results = {'longitude': '1', 'latitude': '1'}
    return render_template('cern_map.html', room=urllib.unquote(room_name), latitude=results['latitude'], longitude=results['longitude'])



@events.route('/map/search/<search>/', methods=['GET'])
def search_map(search):
    return render_template('map.html', search=search)


@events.route('/user_id/', methods=['GET'])
def get_user_id():
    user_id = None
    if 'indico_user' in flask_session:
        user_id = flask_session['indico_user']
    return json.dumps(user_id)


@events.route('/logout/', methods=['GET'])
def logout():
    expired = request.args.get('expired', False)
    flask_session['access_token'] = None
    flask_session['indico_user'] = None
    flask_session['indico_user_name'] = 'None'
    return render_template('index.html', access_token_expired=expired)
