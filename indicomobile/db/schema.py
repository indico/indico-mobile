from datetime import datetime
from flask import Flask, Blueprint
from flask.ext.mongokit import Document
from bson.dbref import DBRef

from indicomobile.db.base import db


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
    structure = {
        'url': unicode,
        '_fossil': unicode,
        'name': unicode
    }


class Material(Document):
    __collection__ = 'materials'
    structure = {
        '_fossil': unicode,
        'id': unicode,
        'title': unicode,
        'resources': [Document]
    }


class Chair(Document):
    __collection__ = 'chairs'
    structure = {
        'id': int,
        'affiliation': unicode,
        '_fossil': unicode,
        'fullName': unicode,
        'email': unicode
    }


class Event(Document):
    __collection__ = 'events'
    structure = {
        'startDate': datetime,
        'endDate': datetime,
        'title': unicode,
        'description': unicode,
        'id': unicode,
        'chairs': [Chair],
        'url': unicode,
        'location': unicode,
        '_fossil': unicode,
        'timezone': unicode,
        'type': unicode,
        'room': unicode,
        'category': unicode,
        'categoryId': unicode,
        'modificationDate': datetime
    }


    # @classmethod
    # def cleanup(cls, query_session, event_id):
    #     query_session.remove_query(Contribution).filter(Contribution.eventId == event_id).execute()
    #     query_session.remove_query(Session).filter(Session.eventId == event_id).execute()
    #     query_session.remove_query(Day).filter(Day.eventId == event_id).execute()
    #     query_session.remove_query(Presenter).filter(Presenter.eventId == event_id).execute()
    #     query_session.remove_query(Chair).filter(Chair.eventId == event_id).execute()
    #     query_session.remove_query(Material).filter(Material.eventId == event_id).execute()
    #     query_session.remove_query(Resource).filter(Resource.eventId == event_id).execute()

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
        'isPoster': bool
    }



class Day(Document):
    __collection__ = 'days'
    structure = {
        'date': unicode,
        'eventId': unicode,
        'entries': list
    }


db.register([Presenter, Resource, Material, Chair, Event, Contribution, SessionSlot, Day])
