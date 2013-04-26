from pytz import utc
import urllib
from datetime import timedelta, datetime
from flask import session as flask_session, abort
import indicomobile.db.event as db_event
import indicomobile.db.session as db_session
import indicomobile.db.contribution as db_contribution
import indicomobile.core.indico_api as api
from indicomobile.util.date_time import dt_from_indico

PAGE_SIZE = 15
# EVENTS
def search_event(search, everything, pageNumber):
    results = api.search_event(search, everything)

    results = sorted(results,
                    key=lambda k: datetime.combine(datetime.strptime(k['startDate']['date'], "%Y-%m-%d"),
                         datetime.strptime(k['startDate']['time'], "%H:%M:%S").time()))
    results.reverse()
    first_element = (pageNumber - 1) * 20
    if everything:
        return results
    return results[first_element:first_element + 20]

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

def _get_cached_events(user_id, type_events, now):
    cached_events = db_event.get_cached_events(user_id, type_events)
    if cached_events:
        if now - cached_events['timestamp'] < timedelta(hours=6):
            return cached_events['events']
    return []

def _get_events(type_events, fetch_function, filter_function):
    user_id = unicode('all_public')
    if 'indico_user' in flask_session:
        if flask_session['indico_user']:
            user_id = flask_session['indico_user']
    now = datetime.utcnow()
    events = _get_cached_events(user_id, type_events, now)
    if not events:
        offset = 0
        while len(events) < PAGE_SIZE:
            results = fetch_function(user_id, offset)
            if not results:
                break
            for event in results:
                if  filter_function(event, now) and event not in events:
                    events.append(event)
                if len(events) == PAGE_SIZE:
                    break
            offset += PAGE_SIZE
        db_event.store_cached_events(user_id,type_events, now, events)
    return events

def get_ongoing_events():
    def filter_events(event, now):
        return utc.localize(now) -dt_from_indico(event['startDate']) < timedelta(days=30)
    return _get_events(unicode("ongoing"),  api.get_today_events, filter_events)

def get_future_events():
    def filter_events(event, now):
        return dt_from_indico(event['startDate']) - utc.localize(now) > timedelta(days=1)
    return _get_events(unicode("future"),  api.get_future_events, filter_events)

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
    return [session for session in db_session.get_event_same_sessions(event_id, session_id)]


def get_event_speakers(event_id, pageNumber):
    return list(db_event.get_event_speakers(event_id, pageNumber, 20))

def get_speaker_contributions(event_id, speaker_id):
    speaker = db_event.get_event_speaker(event_id, speaker_id)
    return db_contribution.get_speaker_contributions(event_id, speaker)

def search_speaker(event_id, search, pageNumber, offset):
    words = urllib.quote(search).split('%20')
    regex = ''
    for word in words:
        regex += '(?=.*' + word + ')'
    return list(db_event.search_speakers(event_id, regex, pageNumber, offset))

def generic_search_contrib(search, event_id, day_date, session_id):
    start_date = datetime.strptime(day_date, '%Y-%m-%d')
    end_date = start_date + timedelta(days=1)
    words = search.split('%20')
    regex = ''
    for word in words:
        regex += '(?=.*' + word + ')'
    return db_contribution.search_contributions(event_id, session_id, start_date, end_date, regex)
