from datetime import datetime
from flask.ext.mongokit import Document

from indicomobile.db import db


class Presenter(Document):
    __collection__ = 'presenters'
    structure = {
        '_fossil': unicode,
        'affiliation': unicode,
        'name': unicode,
        'familyName': unicode,
        'firstName': unicode,
        'name': unicode,
        'email': unicode,
        'id': unicode,
        'conferenceId': unicode
    }


class Resource(Document):
    __collection__ = 'resources'
    skip_validation = True
    structure = {
        'url': unicode,
        '_fossil': unicode,
        'name': unicode,
        'conferenceId': unicode
    }


class Material(Document):
    __collection__ = 'materials'
    skip_validation = True
    structure = {
        '_fossil': unicode,
        'id': unicode,
        'title': unicode,
        'resources': [Document],
        'conferenceId': unicode
    }


class Chair(Document):
    __collection__ = 'chairs'
    structure = {
        'id': int,
        'affiliation': unicode,
        '_fossil': unicode,
        'fullName': unicode,
        'email': unicode,
        'conferenceId': unicode
    }


class Event(Document):
    __collection__ = 'events'
    structure = {
        'startDate': datetime,
        'endDate': datetime,
        'title': unicode,
        'description': unicode,
        'material': [Material],
        'id': unicode,
        'chairs': [Chair],
        'url': unicode,
        'location': unicode,
        'address': unicode,
        '_fossil': unicode,
        'timezone': unicode,
        'type': unicode,
        'room': unicode,
        'category': unicode,
        'categoryId': unicode,
        'modificationDate': datetime,
        'hasAnyProtection': bool,
        'roomMapURL': unicode
    }
    def cleanup(self, event_id):
        db.events.remove({'id': event_id})
        db.contributions.remove({'conferenceId': event_id})
        db.session_slots.remove({'conferenceId': event_id})
        db.days.remove({'conferenceId': event_id})
        db.presenters.remove({'conferenceId': event_id})
        db.materials.remove({'conferenceId': event_id})
        db.resources.remove({'conferenceId': event_id})
        db.chairs.remove({'conferenceId': event_id})

class Contribution(Document):
    pass


class SessionSlot(Document):
    __collection__ = 'session_slots'
    structure = {
        'id': unicode,
        'event': Event,
        'startDate': datetime,
        'sessionSlotId': unicode,
        'endDate': datetime,
        'color': unicode,
        'conferenceId': unicode,
        'inheritLoc': bool,
        'sessionId': unicode,
        'inheritRoom': bool,
        'title': unicode,
        'location': unicode,
        'uniqueId': unicode,
        'contribDuration': int,
        'duration': int,
        'textColor': unicode,
        'description': unicode,
        'material': [Material],
        '_fossil': unicode,
        'sessionCode': unicode,
        'entryType': unicode,
        'room': unicode,
        'isPoster': bool,
        'sessionId': unicode,
        'slotTitle': unicode,
        'entries': [Contribution]
    }
    default_values = {'entries': []}



class Contribution(Document):
    __collection__ = 'contributions'
    structure = {
        'startDate': datetime,
        'event': Event,
        'contributionId': unicode,
        'endDate': datetime,
        'description': unicode,
        'title': unicode,
        'material': [Material],
        'conferenceId': unicode,
        'entryType': unicode,
        'color': unicode,
        'textColor': unicode,
        'duration': int,
        'presenters': [Presenter],
        'slot': SessionSlot,
        'location': unicode,
        'uniqueId': unicode,
        '_fossil': unicode,
        'uniqueId': unicode,
        'room': unicode,
        'isPoster': bool,
        'hasAnyProtection': bool,
        'address': unicode
    }

class Day(Document):
    __collection__ = 'days'
    structure = {
        'date': unicode,
        'conferenceId': unicode,
        'entries': list
    }



class FavoritesContribution(Document):
    __collection__ = 'favorites_contributions'
    structure = {
        'user_id': unicode,
        'contribution': Contribution
    }



class FavoritesSessionSlot(Document):
    __collection__ = 'favorites_session_slots'
    structure = {
        'user_id': unicode,
        'session_slot': SessionSlot
    }



class FavoritesEvent(Document):
    __collection__ = 'favorites_events'
    structure = {
        'user_id': unicode,
        'event': Event
    }

    def cleanup(self, user_id, event_id):
        db.favorites_events.remove({'user_id': user_id, 'event.id': event_id})
        db.favorites_contributions.remove({'user_id': user_id, 'contribution.conferenceId': event_id})
        db.favorites_session_slots.remove({'user_id': user_id, 'session_slot.conferenceId': event_id})


class HistoryEvent(Document):
    __collection__ = 'history_events'
    structure = {
        'user_id': unicode,
        'id': unicode,
        'title': unicode,
        'hasAnyProtection': bool,
        'viewed_at': datetime,
    }


class CachedLatestEvent(Document):
    __collection__ = 'cached_latest_events'
    structure = {
        'user_id': unicode,
        'timestamp': datetime,
        'events': [dict]
    }


db.register([Presenter, Resource, Material, Chair, Event, Contribution,
            SessionSlot, Day, FavoritesContribution, FavoritesSessionSlot,
            FavoritesEvent, HistoryEvent, CachedLatestEvent])
