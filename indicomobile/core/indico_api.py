import urllib2
import urllib
from flask import json, session as flask_session, abort
from indicomobile.views.authentication import oauth_indico_mobile
from indicomobile import app

def attach_params(path, params):
    items = params.items() if hasattr(params, 'items') else list(params)
    if not items:
        return path
    return '%s?%s' % (path, urllib.urlencode(items))

def perform_signed_request(url):
    response = oauth_indico_mobile.get(url)
    if response.status != 200:
        abort(response.status)
    return response.raw_data

def perform_public_request(url):
    try:
        f = urllib2.urlopen(url)
        return f.read()
    except urllib2.HTTPError, err:
        abort(err.code)

def search_event(search, pageNumber):
    try:
        search = urllib.quote(search)
    except Exception:
        return []
    path = '/export/event/search/' + search + '.json'
    if 'indico_mobile_oauthtok' in flask_session:
        result = perform_signed_request(app.config['INDICO_URL'] + path)
    else:
        result = perform_signed_request(app.config['INDICO_URL'] + attach_params(path, {'ak': app.config['API_KEY']}))
    return json.loads(result.decode('utf-8'))["results"]

def get_event_info(event_id):
    path = '/export/event/' + event_id + '.json'
    if 'indico_mobile_oauthtok' in flask_session:
        result = perform_signed_request(app.config['INDICO_URL'] + attach_params(path, {'nocache': 'yes'}))
    else:
        result = perform_public_request(app.config['INDICO_URL'] + attach_params(path, {'nocache': 'yes', 'ak': app.config['API_KEY']}))
    event_info = json.loads(result.decode('utf-8'))["results"]
    if len(event_info)== 0:
        abort(404)
    return event_info[0]


def fetch_timetable(event_id):
    path = '/export/timetable/' + event_id + '.json'
    if 'indico_mobile_oauthtok' in flask_session:
        result = perform_signed_request(app.config['INDICO_URL'] + attach_params(path, {'nocache': 'yes'}))
    else:
        result = perform_public_request(app.config['INDICO_URL'] + attach_params(path, {"ak": app.config['API_KEY']}))
    return json.loads(result.decode('utf-8'))["results"]

def get_latest_events_from_indico(user_id):
    path = '/export/categ/0.json'
    params = { 'nocache': 'yes',
              'from': 'today',
              'order': 'st art',
              'descending': 'yes',
              'detail': 'contributions'
    }
    if user_id != 'all_public':
        result = perform_signed_request(app.config['INDICO_URL'] + attach_params(path, params))
    else:
        params["ak"] = app.config['API_KEY']
        params["limit"] = 100
        result = perform_public_request(app.config['INDICO_URL'] + attach_params(path, params))
    return json.loads(result.decode('utf-8'))["results"]

def get_ongoing_events():
    result = perform_public_request('{0}/export/categ/0.json?ak={1}&from=now&to=now'.format(
            app.config['INDICO_URL'], app.config['API_KEY']))
    return json.loads(result.decode('utf-8'))['results']

def get_future_events():
    result = perform_public_request('{0}/export/categ/0.json?ak={1}&from=1d&limit=50'.format(
        app.config['INDICO_URL'], app.config['API_KEY']))
    return json.loads(result.decode('utf-8'))['results']
