from datetime import datetime
from indicomobile.db import ref
from indicomobile.db.schema import db, Event
from indicomobile.db.common import store_material
from indicomobile.db.session import store_slot
from indicomobile.db.contribution import store_contribution
from indicomobile.util.date_time import convert_dates
from indicomobile.util.tools import clean_html_tags


def get_event(event_id):
    return db.Event.find_one({'id': event_id})

def remove_event(event_id):
    Event().cleanup(event_id)

def get_event_days(event_id):
    return db.Day.find({'conferenceId': event_id}).sort([("date", 1)])

def get_event_day(event_id, day_date):
    return db.Day.find_one({'conferenceId': event_id,'date': day_date})

def create_event_day(event_id, date):
    new_day = db.Day()
    new_day.update({'date': date, 'conferenceId': event_id, 'entries': []})
    return new_day

def get_ongoing_lectures(now, tomorrow):
    return db.Event.find({'$and': [{'startDate': {'$gte': now}},
                                    {'startDate': {'$lt': tomorrow}},
                                    {'type': 'simple_event'}]}).sort([('startDate', 1)])

def get_cached_events(user_id, type_events, pageNumber, offset):
    return db.CachedLatestEvent.find({'user_id': user_id, 'type': type_events}).skip((pageNumber - 1) * offset).limit(offset)

def get_last_offset_cached(user_id, type_events):
    last_offset = db.CachedLatestOffsetAPI.find_one({'user_id': user_id, 'type': type_events})
    if last_offset:
        return last_offset["offset"]
    return 0


def store_chairs(event):
    chairs = []
    for chair_dict in event.get('chairs', []):
        chair = db.Chair()
        chair_dict['conferenceId'] = event.get('id')
        chair.update(chair_dict)
        chair.pop('_type')
        chairs.append(chair)
        chair.save()
    event['chairs'] = chairs

def store_event(event_http, event_tt):
    convert_dates(event_http)
    clean_html_tags(event_http)

    event_id = event_http['id']
    store_material(event_http)
    store_chairs(event_http)

    event_db = db.Event()
    event_db.update(event_http)
    event_db.pop('_type')
    event_db.pop('visibility')
    event_db.save()

    for day, day_content in event_tt.get(event_id, {}).iteritems():
        entries = []

        for _, block_content in day_content.iteritems():
            if block_content['_type'] == 'LinkedTimeSchEntry':
                entry = store_slot(block_content, event_db)
            else:
                entry = store_contribution(block_content, event_db)
            entries.append(ref(entry))
        if len(day_content.keys()) > 0:
            date = datetime.strptime(day, '%Y%M%d').strftime('%Y-%M-%d').decode('utf-8')
            day = db.Day()
            day['date'] = date
            day['conferenceId'] = event_id
            day['entries'] = entries
            day.save()

def store_cached_event(user_id, type_events, date, event):
    clean_html_tags(event)
    new_cached_events = db.CachedLatestEvent()
    new_cached_events.update({'user_id': user_id, 'event_id': event['id'], "type": type_events, 'timestamp': date, 'event': event})
    new_cached_events.save()

def remove_cached_events(user_id, type_events):
    db.cached_latest_events.remove({'user_id': user_id, "type": type_events})

def store_last_offset_cached(user_id, type_events, offset):
    last_offset_cached = db.CachedLatestOffsetAPI()
    last_offset_cached.update({'user_id': user_id, "type": type_events, 'offset': offset})
    last_offset_cached.save()

def remove_last_offset_cached(user_id, type_events):
    db.cached_latest_offset.remove({'user_id': user_id, "type": type_events})

# SPEAKERS

def get_event_speaker(event_id, speaker_id):
    return db.Presenter.find_one({'id': speaker_id, 'conferenceId': event_id})

def get_event_speakers(event_id, pageNumber, offset):
    return db.Presenter.find({'conferenceId': event_id}).sort([('name', 1)]).skip((pageNumber - 1) * offset).limit(offset)

# AGENDA

def get_favorites_event(user_id, event_id):
    return db.FavoritesEvent.find_one({'user_id': user_id, 'event.id': event_id})

def get_favorites_events(user_id):
    return db.FavoritesEvent.find({'user_id': user_id})

def add_event_to_favorites(user_id, event):
    favorites_event = db.FavoritesEvent()
    favorites_event.update({'user_id': user_id, 'event': event})
    favorites_event.save()

def remove_full_event_from_favorites(user_id, event_id):
    db.FavoritesEvent.cleanup(user_id, event_id)

def remove_event_from_favorites(user_id, event_id):
    db.favorites_events.remove({'user_id': user_id, 'event.id': event_id})

# HISTORY DB LOGIC
def get_history(user_id, order = 1):
    return db.HistoryEvent.find({'user_id': user_id}).sort('viewed_at', order)

def get_event_in_history(user_id, event_id):
    return db.HistoryEvent.find_one({'id': event_id, 'user_id': user_id})

def update_event_to_history(event, date):
    event.update({'viewed_at': date})
    event.save()

def add_event_to_history(user_id, date, event, event_id):
    new_event = db.HistoryEvent()
    new_event.update({'user_id': user_id, 'viewed_at': date, 'title': event['title'],
                    'id': event_id, 'hasAnyProtection': event['hasAnyProtection']})
    new_event.save()

def remove_event_from_history(user_id, event_id):
    db.history_events.remove({'user_id': user_id, 'id': event_id})
