import urllib

import requests
from requests.exceptions import HTTPError
from urlparse import urljoin

from flask import session, abort
from indicomobile import app
from indicomobile.views.authentication import indico


def attach_params(params):
    items = params.items() if hasattr(params, 'items') else list(params)
    if not items:
        return ''
    return urllib.urlencode(items)


def perform_request(path, params=None, signed=None):
    """Performs an HHTP GET request to the Indico API.

    In the case of a signed request, the API key is automatically added.
    But you are free to define a different key  (``ak``) in the params.

    :param path: str -- the API path for the resource to get
    :param params: (optional) Dictionary or bytes to be sent in the
                   query string
    :param signed: Whether to perform a signed request or not. If
                   omitted, the request will be signed if an oauth token
                   is present.
    """
    url = urljoin(app.config['INDICO_URL'], path)
    params = params or {}
    if signed is None:
        signed = 'indico_mobile_oauthtok' in session
    if signed:
        params.setdefault('ak', app.config['API_KEY'])
    get_request = indico.get if signed else requests.get
    verify = app.config.get('CERT_FILE') or True
    response = get_request(url, params=params, verify=verify)
    try:
        response.raise_for_status()
    except HTTPError as err:
        abort(err.response.status)
    return response.json()


def search_event(query, page_number):
    try:
        query = urllib.quote(query)
    except Exception:
        return []
    path = '/export/event/search/{query}.json'.format(query=query)
    params = {'nocache': 'yes' if app.config.get('DEBUG', False) else 'no',
              'order': 'start',
              'descending': 'yes',
              'limit': 20,
              'offset': (page_number - 1) * 20}
    response = perform_request(path, params=params)
    return response['results']


def get_event_info(event_id):
    path = '/export/event/{event_id}.json'.format(event_id=event_id)
    params = {'nocache': 'yes' if app.config.get('DEBUG', False) else 'no'}
    signed = 'indico_mobile_oauthtok' in session
    response = perform_request(path, params=params, signed=signed)
    event_info = response['results']
    return event_info[0] if event_info else None


def fetch_timetable(event_id):
    path = '/export/timetable/{event_id}.json'.format(event_id=event_id)
    params = {'nocache': 'yes' if app.config.get('DEBUG', False) else 'no'}
    response = perform_request(path, params=params)
    return response['results']


def get_ongoing_events():
    response = perform_request('/export/categ/0.json', params={'from': 'now', 'to': 'now'}, signed=False)
    return response['results']


def get_today_events(user_id):
    return get_future_events(user_id, 'now', 'today')


def get_future_events(user_id, start_date, end_date):
    path = '/export/categ/0.json'
    params = {'nocache': 'yes' if app.config.get('DEBUG', False) else 'no',
              'from': start_date,
              'to': end_date,
              'order': 'start'}
    signed = user_id != 'all_public'
    response = perform_request(path, params=params, signed=signed)
    return response['results'], response['additionalInfo']['moreFutureEvents']


def get_room(room_name):
    path = '/export/roomName/CERN/{room_name}.json'.format(urllib.quote(room_name))
    response = perform_request(path)
    return response['results']
