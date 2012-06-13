from flask import Flask, Blueprint
from flaskext.mongoalchemy import MongoAlchemy
from bson.dbref import DBRef

from indicomobile.db.base import DBClass, db


class Presenter(DBClass):
    _fossil = db.StringField()
    affiliation = db.StringField()
    _type = db.StringField()
    name = db.StringField()
    familyName = db.StringField()
    firstName = db.StringField()
    name = db.StringField()
    email = db.AnythingField()


class Resource(DBClass):
    url = db.StringField()
    _fossil = db.StringField()
    _type = db.StringField()
    name = db.StringField()


class Material(DBClass):
    _fossil = db.StringField()
    _type = db.StringField()
    id = db.StringField()
    title = db.StringField()
    resources = db.ListField(db.DocumentField(Resource))


class Event(DBClass):
    startDate = db.DateTimeField()
    endDate = db.DateTimeField()
    title = db.StringField()
    _type = db.StringField()
    description = db.StringField()
    id = db.StringField()
    chairs = db.ListField(db.DocumentField('Chair'))
    url = db.StringField()
    location = db.StringField(allow_none=True)
    _fossil = db.StringField()
    timezone = db.StringField()
    type = db.StringField()
    id = db.StringField()
    room = db.AnythingField()
    category = db.StringField()
    categoryId = db.StringField()
    modificationDate = db.DateTimeField()

    @classmethod
    def cleanup(cls, query_session, event_id):
        query_session.remove_query(Contribution).filter(Contribution.eventId == event_id).execute()
        query_session.remove_query(Session).filter(Session.eventId == event_id).execute()
        query_session.remove_query(Day).filter(Day.eventId == event_id).execute()
        query_session.remove_query(Presenter).filter(Presenter.eventId == event_id).execute()
        query_session.remove_query(Chair).filter(Chair.eventId == event_id).execute()
        query_session.remove_query(Material).filter(Material.eventId == event_id).execute()
        query_session.remove_query(Resource).filter(Resource.eventId == event_id).execute()


class SessionSlot(DBClass):
    pass

class Contribution(DBClass):
    _type = db.StringField()
    startDate = db.DateTimeField()
    contributionId = db.StringField(default='')
    endDate = db.DateTimeField()
    description = db.StringField()
    title = db.StringField()
    material = db.ListField(db.DocumentField(Material))
    conferenceId = db.StringField()
    entryType = db.StringField()
    color = db.StringField(default=None, required=False, allow_none=True)
    textColor = db.StringField(default=None, required=False, allow_none=True)
    duration = db.IntField(default=0)
    presenters = db.ListField(db.RefField(db.DocumentField(Presenter)))
    slot = db.RefField(db.DocumentField(SessionSlot), allow_none=True)
    location = db.StringField()
    uniqueId = db.StringField()
    _fossil = db.StringField()
    uniqueId = db.StringField(default='')
    room = db.StringField()
    isPoster = db.BoolField(default=False)


class SessionSlot(DBClass):
    id = db.StringField()
    event = db.RefField(db.DocumentField(Event))
    startDate = db.DateTimeField()
    sessionSlotId = db.AnythingField()
    endDate = db.DateTimeField()
    color = db.StringField(default=None, required=False, allow_none=True)
    conferenceId = db.StringField()
    inheritLoc = db.BoolField(default=False)
    sessionId = db.StringField()
    inheritRoom = db.BoolField(default=False)
    title = db.StringField()
    location = db.StringField()
    uniqueId = db.StringField(default='')
    contribDuration = db.AnythingField(default='')
    duration = db.IntField(default=0)
    textColor = db.StringField(default=None, required=False, allow_none=True)
    _type = db.StringField()
    description = db.StringField()
    material = db.ListField(db.DocumentField(Material))
    _fossil = db.StringField()
    sessionCode = db.AnythingField()
    entryType = db.StringField()
    room = db.StringField()
    isPoster = db.BoolField(default=False)
    sessionId = db.AnythingField()
    slotTitle = db.StringField(default='')
    entries = db.ListField(db.RefField(db.DocumentField(Contribution)))


class Chair(DBClass):
    _type = db.StringField()
    id = db.AnythingField()
    affiliation = db.StringField()
    _fossil = db.StringField()
    fullName = db.StringField()
    email = db.StringField()


class Day(DBClass):
    date = db.DateTimeField()
    eventId = db.StringField()
    entries = db.AnythingField()
