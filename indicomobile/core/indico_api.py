import urllib2
import urllib

import requests

from flask import json, session as flask_session, abort
from indicomobile import app
from indicomobile.util.tools import construct_url
from indicomobile.views.authentication import indico


def attach_params(params):
    items = params.items() if hasattr(params, 'items') else list(params)
    if not items:
        return ''
    return urllib.urlencode(items)


def perform_signed_request(url):
    response = indico.get(url)
    if response.status_code != requests.codes.ok:
        abort(response.status)
    return response.raw


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
    params = {'nocache': 'yes' if app.config.get('DEBUG', False) else 'no',
              'order': 'start',
              'descending': 'yes',
              'limit': 20,
              'offset': (pageNumber - 1) * 20}
    if 'indico_mobile_oauthtok' in flask_session:
        result = perform_signed_request(construct_url(path, attach_params(params)))
    else:
        params['ak'] = app.config['API_KEY']
        result = perform_public_request(construct_url(path, attach_params(params)))
    return json.loads(result.decode('utf-8'))['results']


def get_event_info(event_id):
    path = '/export/event/' + event_id + '.json'
    params = {'nocache': 'yes' if app.config.get('DEBUG', False) else 'no'}
    if 'indico_mobile_oauthtok' in flask_session:
        result = perform_signed_request(construct_url(path, attach_params(params)))
    else:
        params['ak'] = app.config['API_KEY']
        result = perform_public_request(construct_url(path, attach_params(params)))
    event_info = json.loads(result.decode('utf-8'))['results']
    if not event_info:
        return None
    return event_info[0]


def fetch_timetable(event_id):
    path = '/export/timetable/' + event_id + '.json'
    if 'indico_mobile_oauthtok' in flask_session:
        params = {'nocache': 'yes' if app.config.get('DEBUG', False) else 'no'}
        result = perform_signed_request(construct_url(path, attach_params(params)))
    else:
        {'ak': app.config['API_KEY']}
        result = perform_public_request(construct_url(path, attach_params(params)))
    return json.loads(result.decode('utf-8'))['results']


def get_ongoing_events():
    result = perform_public_request('{0[INDICO_URL]}/export/categ/0.json?ak={0[API_KEY]}&from=now&to=now'
                                    .format(app.config))
    return json.loads(result.decode('utf-8'))['results']


def get_today_events(user_id):
    return get_future_events(user_id, 'now', 'today')


def get_future_events(user_id, startDate, endDate):
    path = '/export/categ/0.json'
    params = {'nocache': 'yes' if app.config.get('DEBUG', False) else 'no',
              'from': startDate,
              'to': endDate,
              'order': 'start'}
    if user_id != 'all_public':
        result = perform_signed_request(construct_url(path, attach_params(params)))
    else:
        params['ak'] = app.config['API_KEY']
        result = perform_public_request(construct_url(path, attach_params(params)))
    result = json.loads(result.decode('utf-8'))
    return result['results'], result['additionalInfo']['moreFutureEvents']


def get_room(room_name):
    path = '/export/roomName/CERN/' + urllib.quote(room_name) + '.json'
    if 'indico_mobile_oauthtok' in flask_session:
        result = perform_signed_request(construct_url(path, attach_params({})))
    else:
        result = perform_public_request(construct_url(path, attach_params({'ak': app.config['API_KEY']})))
    return json.loads(result.decode('utf-8'))['results']
