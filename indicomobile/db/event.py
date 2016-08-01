from datetime import datetime
from indicomobile.db import ref
from indicomobile.db.schema import db, Event
from indicomobile.db.common import store_material
from indicomobile.db.session import store_slot
from indicomobile.db.contribution import store_contribution
from indicomobile.util.date_time import convert_dates, dt_from_indico
from indicomobile.util.tools import clean_html_tags


def get_event(event_id):
    return db.Event.find_one({'id': event_id})


def is_favorite(event_id, user_id):
    return db.FavoritesEvent.find_one({'event.id': event_id, 'user_id': user_id}) is not None


def remove_event(event_id):
    Event().cleanup(event_id)


def get_event_days(event_id):
    return db.Day.find({'conferenceId': event_id}).sort([("date", 1)])


def get_event_day(event_id, day_date):
    return db.Day.find_one({'conferenceId': event_id, 'date': day_date})


def create_event_day(event_id, date):
    new_day = db.Day()
    new_day.update({'date': date, 'conferenceId': event_id, 'entries': []})
    return new_day


def get_ongoing_lectures(now, tomorrow):
    return db.Event.find({'$and': [{"$or": [{"$and": [{'startDate': {'$gte': now}},
                                                      {'startDate': {'$lt': tomorrow}}]},
                                            {"$and": [{'endDate': {'$gte': now}},
                                                      {'endDate': {'$lt': tomorrow}}]}]},
                                   {'type': 'simple_event'}]}).sort([('startDate', 1)])


def get_cached_events(user_id, pageNumber, offset):
    return db.CachedLatestEvent.find({'user_id': user_id}).sort([('event_start_date', 1)]).skip((pageNumber - 1) * offset).limit(offset)


def get_last_event_cached(user_id):
    event = list(db.CachedLatestEvent.find({"user_id": user_id}).limit(1).sort([("event_start_date", -1)]))
    if event:
        return event[0]
    return None


def is_cached(user_id, event_id):
    return db.CachedLatestEvent.find_one({'event_id': event_id, 'user_id': user_id}) is not None


def store_chairs(event):
    chairs = []
    for chair_dict in event.get('chairs', []):
        chair = db.Chair()
        chair_dict['conferenceId'] = event.get('id')
        chair.update(chair_dict)
        chair.pop('_type')
        chair = db.Chair.find_and_modify({'conferenceId': event.get('id'), 'id': chair['id']}, chair, upsert=True, new=True)
        chairs.append(chair)
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
    saved_event = db.Event.find_and_modify({'id': event_id}, event_db, upsert=True, new=True)

    for day, day_content in event_tt.get(event_id, {}).iteritems():
        entries = []

        for _, block_content in day_content.iteritems():
            if block_content['entryType'] == 'Block':
                entry = store_slot(block_content, saved_event)
            else:
                entry = store_contribution(block_content, saved_event)
            entries.append(ref(entry))
        if len(day_content.keys()) > 0:
            date = datetime.strptime(day, '%Y%M%d').strftime('%Y-%M-%d').decode('utf-8')
            day = db.Day()
            day['date'] = date
            day['conferenceId'] = event_id
            day['entries'] = entries
            db.Day.find_and_modify({'conferenceId': event_id, 'date': date}, day, upsert=True)


def store_cached_event(user_id, date, event):
    clean_html_tags(event)
    new_cached_events = db.CachedLatestEvent()
    new_cached_events.update({'user_id': user_id, 'event_id': event['id'], 'event_start_date': dt_from_indico(event["startDate"]), 'timestamp': date, 'event': event})
    db.CachedLatestEvent.find_and_modify({'user_id': user_id, 'event_id': event['id'], 'timestamp': date}, new_cached_events, upsert=True)


def remove_cached_events(user_id, timestamp):
    db.cached_latest_events.remove({'user_id': user_id, 'timestamp': {"$lt": timestamp}})


def remove_cached_event(user_id, event_id):
    db.cached_latest_events.remove({'user_id': user_id, 'event_id': event_id})


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
    db.FavoritesEvent.find_and_modify({'user_id': user_id, 'event.id': event["id"]}, favorites_event, upsert=True)


def remove_full_event_from_favorites(user_id, event_id):
    db.FavoritesEvent.cleanup(user_id, event_id)


def remove_event_from_favorites(user_id, event_id):
    db.favorites_events.remove({'user_id': user_id, 'event.id': event_id})


# HISTORY DB LOGIC
def get_history(user_id, order=1):
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
    db.HistoryEvent.find_and_modify({'user_id': user_id, 'id': event_id}, new_event, upsert=True)


def remove_event_from_history(user_id, event_id):
    db.history_events.remove({'user_id': user_id, 'id': event_id})
