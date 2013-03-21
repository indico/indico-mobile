import urllib2
import urllib
import time
import hashlib
import hmac
from flask import json, current_app, session as flask_session, abort

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

def search_event(search, pageNumber):
    try:
        search = urllib.quote(search)
    except Exception:
        return []
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
            }
            url = current_app.config['SERVER_URL'] + sign_request(path, params, at_key, at_secret)
    req = urllib2.Request(url)
    opener = urllib2.build_opener()
    try:
        f = opener.open(req)
    except urllib2.HTTPError, err:
        if err.code == 401:
            abort(401)
        else:
            return []
    return json.load(f)['results']

def get_event_info(event_id):
    url = current_app.config['SERVER_URL'] + \
                                '/export/event/' + event_id + \
                                '.json?ak=' + current_app.config['API_KEY'] + '&nocache=yes'
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


def get_latest_events_from_indico(user_id):
    url = '{0}/export/categ/0.json?ak={1}&from=today&limit=100&detail=contributions&order=start&descending=yes&nocache=yes'.format(
            current_app.config['SERVER_URL'], current_app.config['API_KEY'])
    if user_id != 'all_public':
        at_key = flask_session['access_token'].get('key')
        at_secret = flask_session['access_token'].get('secret')
        path = '/export/categ/0.json'
        params = {
            'nocache': 'yes',
            'from': 'today',
            'order': 'start',
            'descending': 'yes',
            'detail': 'contributions'
        }
        url = current_app.config['SERVER_URL'] + sign_request(path, params, at_key, at_secret)
    try:
        f = urllib2.urlopen(url)
    except urllib2.HTTPError, err:
        return {'error': err.code}
    events = json.loads(f.read().decode('utf-8'))['results']
    return events


def get_ongoing_events():
    url = '{0}/export/categ/0.json?ak={1}&from=now&to=now'.format(
            current_app.config['SERVER_URL'], current_app.config['API_KEY'])
    f = urllib2.urlopen(url)
    return json.loads(f.read().decode('utf-8'))['results']


def get_future_events():
    url = '{0}/export/categ/0.json?ak={1}&from=1d&limit=50'.format(
        current_app.config['SERVER_URL'], current_app.config['API_KEY'])
    f = urllib2.urlopen(url)
    return json.loads(f.read().decode('utf-8'))['results']
