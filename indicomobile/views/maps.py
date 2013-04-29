import urllib, urllib2
from flask import json, current_app, render_template, Blueprint
from indicomobile.core.indico_api import get_room

maps = Blueprint('map', __name__, template_folder='templates')

@maps.route('/map/location/CERN/room/<room_name>/', methods=['GET'])
def get_map(room_name):
    results = get_room(room_name)
    if len(results) > 0:
        results = results[0]
    else:
        results = {'longitude': '1', 'latitude': '1'}

    return render_template('map.html',
                           map_title="Room: %s"%urllib.unquote(room_name),
                           not_found_msg="Sorry this room cannot be found.",
                           room=urllib.unquote(room_name),
                           latitude=results['latitude'],
                           longitude=results['longitude'])


@maps.route('/map/search/<search>/', methods=['GET'])
def search_map(search):
    return render_template('map.html',
                           map_title="Map result for: %s"%search,
                           not_found_msg="Sorry the location cannot be found.",
                           search=search,
                           latitude=None,
                           longitude=None)
