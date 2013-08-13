from pytz import utc
import urllib
from datetime import timedelta, datetime
from flask import session as flask_session, abort
import indicomobile.db.event as db_event
import indicomobile.db.session as db_session
import indicomobile.db.contribution as db_contribution
import indicomobile.core.indico_api as api
from indicomobile.util.date_time import dt_from_indico
from indicomobile.core.cache import cache, make_cache_key
import indicomobile.core.favorites as favorites

PAGE_SIZE = 15
# EVENTS
@cache.cached(key_prefix=make_cache_key)
def search_event(search, pageNumber):
    return api.search_event(search, pageNumber)

def update_event_info(event_id):
    if event_id:
        event_http = api.get_event_info(event_id)
        if event_http:
            event_db = db_event.get_event(event_id)
            if not event_db:
                event_tt = api.fetch_timetable(event_id)
                db_event.store_event(event_http, event_tt)
            elif utc.localize(event_db['modificationDate']) < dt_from_indico(event_http['modificationDate']):
                db_event.remove_event(event_id)
                event_tt = api.fetch_timetable(event_id)
                db_event.store_event(event_http, event_tt)


def _filter_events(user_id, now, events):
    for event in events:
        if utc.localize(now) - dt_from_indico(event['startDate']) < timedelta(days=30):
            db_event.store_cached_event(user_id, now, event)

def _filter_future_events(user_id, now, events):
    cached = False
    for event in events:
        if dt_from_indico(event['startDate']) - utc.localize(now) > timedelta(days=1) and not db_event.is_cached(user_id, event["id"]):
            cached= True
            db_event.store_cached_event(user_id, now, event)
    return cached

def _get_future_events(user_id, now, last_start_date):
    days = 1
    date = (last_start_date + timedelta(days=days)).strftime("%Y-%m-%d")
    while not _filter_future_events(user_id, now, api.get_future_events(user_id, date, date)):
        days += 1
        date = (last_start_date + timedelta(days=days)).strftime("%Y-%m-%d")

def _get_cached_events(user_id, now, page):
    db_event.remove_cached_events(user_id, now - timedelta(hours=2))
    cached_events = list(db_event.get_cached_events(user_id, page, PAGE_SIZE))
    if not cached_events:
        last_event = db_event.get_last_event_cached(user_id)
        if not last_event:
            _filter_events(user_id, now, api.get_today_events(user_id))
        else:
            _get_future_events(user_id, now, last_event["event_start_date"])
        cached_events = list(db_event.get_cached_events(user_id, page,  PAGE_SIZE))
    while len(cached_events) < PAGE_SIZE:
        last_event = db_event.get_last_event_cached(user_id)
        if not last_event:
            break
        _get_future_events(user_id, now, last_event["event_start_date"])
        cached_events = list(db_event.get_cached_events(user_id, page,  PAGE_SIZE))

    return [event["event"] for event in cached_events]

def get_ongoing_events(page=1):
    user_id = unicode('all_public')
    if 'indico_user' in flask_session:
        if flask_session['indico_user']:
            user_id = flask_session['indico_user']
    now = datetime.utcnow()
    events = _get_cached_events(user_id, now, page)
    if flask_session.get("indico_user", ""):
        favorites.get_favorites_events(events, flask_session["indico_user"])
    return events


def get_event_days(event_id):
    return [day for day in db_event.get_event_days(event_id)]

# CONTRIBUTIONS

def get_ongoing_contributions():
    events = api.get_ongoing_events()
    for event in events:
        if not db_event.get_event(event['id']):
            # store event
            event_tt = api.fetch_timetable(event['id'])
            db_event.store_event(event, event_tt)

    now = datetime.utcnow()
    tomorrow = now + timedelta(hours=6)
    results = list(db_contribution.get_contributions(now, tomorrow, [{'hasAnyProtection': False},
                                                                             {'_fossil': 'contribSchEntryDisplay'}])) \
            + list(db_event.get_ongoing_lectures(now, tomorrow))

    if flask_session.get("indico_user", ""):
        for contrib in results:
            contrib["favorite"] = favorites.is_contribution_favorite(contrib, flask_session["indico_user"])
    return sorted(results, key=lambda x: x['startDate'])

def get_future_contributions():
    events = api.get_future_events()
    for event in events:
        if not db_event.get_event(event['id']):
            # store event
            event_tt = api.fetch_timetable(event['id'])
            db_event.store_event(event, event_tt)

    now = datetime.utcnow()
    tomorrow = now + timedelta(hours=6)
    results = list(db_contribution.get_contributions(now, tomorrow, [{'hasAnyProtection': False},
                                                                     {'_fossil': 'contribSchEntryDisplay'}])) \
            + list(db_event.get_ongoing_lectures(now, tomorrow))
    return sorted(results, key=lambda x: x['startDate'])

def get_event_day_contributions(event_id, day_date):
    start_date = datetime.strptime(day_date, '%Y-%m-%d')
    end_date = start_date + timedelta(days=1)
    return list(db_contribution.get_contributions(start_date, end_date, [{'conferenceId': event_id}]))


def get_session_day_contributions(event_id, session_id, day):
    start_date = datetime.strptime(day, '%Y-%m-%d')
    end_date = start_date + timedelta(days=1)
    contributions = db_session.get_session_day_contributions(event_id, session_id, start_date, end_date)
    return sorted(contributions.values(), key=lambda x: x['startDate'])


# SESSIONS

def get_event_sessions(event_id):
    event = db_event.get_event(event_id)

    if not event:
        abort(400)

    sessions = db_session.get_full_event_sessions(event["id"])
    return sorted(sessions.values(), key=lambda x: x['title'])


def get_event_same_sessions(event_id, session_id):
    return list(db_session.get_event_same_sessions(event_id, session_id))


def get_event_speakers(event_id, pageNumber):
    return list(db_event.get_event_speakers(event_id, pageNumber, 20))

def get_speaker_contributions(event_id, speaker_id):
    speaker = db_event.get_event_speaker(event_id, speaker_id)
    return db_contribution.get_speaker_contributions(event_id, speaker)
