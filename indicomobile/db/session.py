from indicomobile.db import ref
from indicomobile.db.schema import db
from indicomobile.db.contribution import store_contribution, store_material
from indicomobile.util.date_time import convert_dates
from indicomobile.util.tools import clean_html_tags

def get_event_session(event_id, session_id):
    return db.SessionSlot.find_one({'conferenceId': event_id, 'sessionId': session_id})

def get_event_sessions(event_id):
    return db.SessionSlot.find({'conferenceId': event_id}).distinct('sessionId')

def get_event_session_slots(event_id, include_contribs):
    slots = list(db.SessionSlot.find({'conferenceId': event_id}).distinct('sessionId'))
    if include_contribs:
        for slot in slots:
            for contrib in slot['entries']:
                current_contrib = db.dereference(contrib)
                current_contrib['slot'] = slot
                contrib = current_contrib
    return slots


def get_full_event_sessions(event_id):
    sessions = {}
    slots = db.SessionSlot.find({'conferenceId': event_id}).sort([('title', 1)])
    for slot in slots:
        sessions[slot['sessionId']] = slot
    return sessions

def get_event_same_sessions(event_id, session_id):
    return db.SessionSlot.find({'conferenceId': event_id, 'sessionId': session_id}).sort([('startDate', 1)])

def get_event_day_session(event_id, session_id, start_date, end_date):
    return db.SessionSlot.find({'$and': [{'conferenceId': event_id},
                                    {'sessionId': session_id},
                                    {'startDate': {'$gte': start_date}},
                                    {'startDate':{'$lt': end_date}}]}).sort([('startDate', 1)])


def get_session_day_contributions(event_id, session_id, start_date, end_date):
    session = db.SessionSlot.find({'$and': [{'startDate': {'$gte': start_date}},
                                            {'startDate': {'$lt': end_date}},
                                            {'conferenceId': event_id},
                                            {'sessionId': session_id}]}).sort([('startDate', 1)])
    contributions = {}
    for slot in session:
        for contrib in slot['entries']:
            current_contrib = db.dereference(contrib)
            current_contrib['slot'] = slot
            contributions[current_contrib['contributionId']] = current_contrib
    return contributions



def store_slot(slot, event):
    convert_dates(slot)
    clean_html_tags(slot)

    session_id = slot['sessionId']
    is_poster = slot['isPoster']
    slot_id = slot['id']
    color = slot['color']

    slot['event'] = ref(event)
    slot.pop('conveners')
    slot.pop('_type')

    db_slot = db.SessionSlot()
    db_slot.update(slot)
    db_slot['entries'] = []

    db_slot.save()

    entries = []

    for contribution, block_content in slot.get('entries', {}).iteritems():
        if block_content['_type'] == 'ContribSchEntry':
            entries.append(ref(store_contribution(block_content, event, color, is_poster, db_slot)))
    db_slot['entries'] = entries
    if len(db_slot['entries']) > 0:
        db_slot.save()
        store_material(slot)
    return db_slot

# AGENDA

def get_favorites_session(user_id, event_id, session_id):
    return db.FavoritesSessionSlot.find_one({'user_id': user_id,
                                                    'session_slot.sessionId':session_id,
                                                    'session_slot.conferenceId': event_id})

def get_favorites_sessions(user_id, distinct = False):
    if distinct:
        return db.FavoritesSessionSlot.find({'user_id': user_id}).distinct('session_slot.conferenceId')
    return db.FavoritesSessionSlot.find({'user_id': user_id})


def get_favorites_event_sessions(user_id, event_id):
    return db.FavoritesSessionSlot.find({'user_id': user_id, 'session_slot.conferenceId': event_id})

def add_session_to_favorites(user_id, session_slot):
    favorites_session = db.FavoritesSessionSlot()
    favorites_session.update({'user_id': user_id, 'session_slot': session_slot})
    favorites_session.save()

def remove_session_from_favorites(user_id, event_id, session_id):
    db.favorites_session_slots.remove({'user_id': user_id, 'session_slot.conferenceId': event_id, 'session_slot.sessionId': session_id})

def remove_event_sessions_from_favorites(user_id, event_id):
    db.favorites_session_slots.remove({'user_id': user_id, 'session_slot.conferenceId': event_id})
