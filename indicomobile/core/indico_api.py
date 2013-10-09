import urllib2
import urllib
from urlparse import urlparse, urlunparse

from flask import json, session as flask_session, abort
from indicomobile.views.authentication import oauth_indico_mobile
from indicomobile import app

def construct_url(path, params):
    url_fragments = urlparse(app.config['INDICO_URL'])
    url_path = url_fragments.path
    if url_path and url_path[-1] == "/":
        url_path = url_path[:-1]
    url_path += path
    return urlunparse((url_fragments.scheme, url_fragments.netloc, url_path , "", params, ""))

def attach_params(params):
    items = params.items() if hasattr(params, 'items') else list(params)
    if not items:
        return ""
    return urllib.urlencode(items)

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
    params = { 'nocache': 'yes' if app.config.get("DEBUG", False) else "no",
              'order': 'start',
              'descending': 'yes',
              'limit': 20,
              'offset': (pageNumber -1 )* 20
    }
    if 'indico_mobile_oauthtok' in flask_session:
        result = perform_signed_request(construct_url(path, attach_params(params)))
    else:
        params["ak"] = app.config['API_KEY']
        result = perform_public_request(construct_url(path, attach_params(params)))
    return json.loads(result.decode('utf-8'))["results"]

def get_event_info(event_id):
    path = '/export/event/' + event_id + '.json'
    if 'indico_mobile_oauthtok' in flask_session:
        result = perform_signed_request(construct_url(path, attach_params({'nocache': 'yes' if app.config.get("DEBUG", False) else "no"})))
    else:
        result = perform_public_request(construct_url(path, attach_params({'nocache': 'yes' if app.config.get("DEBUG", False) else "no", 'ak': app.config['API_KEY']})))
    event_info = json.loads(result.decode('utf-8'))["results"]
    if len(event_info)== 0:
        return None
    return event_info[0]


def fetch_timetable(event_id):
    path = '/export/timetable/' + event_id + '.json'
    if 'indico_mobile_oauthtok' in flask_session:
        result = perform_signed_request(construct_url(path, attach_params({'nocache': 'yes' if app.config.get("DEBUG", False) else "no"})))
    else:
        result = perform_public_request(construct_url(path, attach_params({"ak": app.config['API_KEY']})))
    return json.loads(result.decode('utf-8'))["results"]

def get_ongoing_events():
    result = perform_public_request('{0}/export/categ/0.json?ak={1}&from=now&to=now'.format(
            app.config['INDICO_URL'], app.config['API_KEY']))
    return json.loads(result.decode('utf-8'))['results']

def get_today_events(user_id):
    path = '/export/categ/0.json'
    params = { 'nocache': 'yes' if app.config.get("DEBUG", False) else "no",
              'from': 'now',
              'to': 'today',
              'order': 'start'
    }
    if user_id != 'all_public':
        result = perform_signed_request(construct_url(path, attach_params(params)))
    else:
        params["ak"] = app.config['API_KEY']
        result = perform_public_request(construct_url(path, attach_params(params)))
    result = json.loads(result.decode('utf-8'))
    return result["results"], result["additionalInfo"]["moreFutureEvents"]

def get_future_events(user_id, startDate, endDate):
    path = '/export/categ/0.json'
    params = { 'nocache': 'yes' if app.config.get("DEBUG", False) else "no",
              'from': startDate,
              'to': endDate,
              'order': 'start'
    }
    if user_id != 'all_public':
        result = perform_signed_request(construct_url(path, attach_params(params)))
    else:
        params["ak"] = app.config['API_KEY']
        result = perform_public_request(construct_url(path, attach_params(params)))
    result = json.loads(result.decode('utf-8'))
    return result["results"], result["additionalInfo"]["moreFutureEvents"]

def get_user_info(user_id):
    return oauth_indico_mobile.get(construct_url("/export/user/%s.json"%user_id, {})).data["results"][0]

def get_room(room_name):
    path = '/export/roomName/CERN/' + urllib.quote(room_name) + '.json'
    if 'indico_mobile_oauthtok' in flask_session:
        result = perform_signed_request(construct_url(path, attach_params({})))
    else:
        result = perform_public_request(construct_url(path, attach_params({"ak": app.config['API_KEY']})))
    return json.loads(result.decode('utf-8'))["results"]
