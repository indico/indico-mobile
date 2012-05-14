from flask import Flask, Blueprint
from flaskext.mongoalchemy import MongoAlchemy

from indicomobile.db.base import DBClass, db


class Presenter_id():

    def __init__(self):
        self._counter = 0

    def __call__(self):
        val = self._counter
        self._counter += 1
        return val


class Presenter(DBClass):
    _fossil = db.StringField()
    affiliation = db.StringField()
    _type = db.StringField()
    name = db.StringField()
    contributionId = db.ListField(db.AnythingField())
    eventId = db.AnythingField()
    id = db.AnythingField()


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
    resources = db.ListField(db.DocumentField('Resource'))


class Contribution(DBClass):
    _type = db.StringField()
    startDate = db.DateTimeField()
    sessionSlotId = db.StringField()
    contributionId = db.StringField(default='')
    endDate = db.DateTimeField()
    description = db.StringField()
    title = db.StringField()
    sessionTitle = db.StringField()
    material = db.ListField(db.DocumentField('Material'))
    conferenceId = db.StringField()
    entryType = db.StringField()
    color = db.StringField(default='')
    textColor = db.StringField(default='')
    duration = db.IntField(default=0)
    presenters = db.ListField(db.DocumentField('Presenter'))
    sessionId = db.StringField()
    sessionUniqueId = db.StringField()
    location = db.StringField()
    uniqueId = db.StringField()
    _fossil = db.StringField()
    sessionCode = db.StringField()
    uniqueId = db.StringField(default='')
    room = db.StringField()
    isPoster = db.BoolField(default=False)
    eventId = db.AnythingField()
    dayDate = db.StringField()


class Session(DBClass):
    id = db.StringField()
    startDate = db.DateTimeField()
    sessionSlotId = db.AnythingField()
    contributionId = db.AnythingField(default='')
    endDate = db.DateTimeField()
    color = db.StringField(default='')
    conferenceId = db.StringField()
    inheritLoc = db.BoolField(default=False)
    sessionId = db.StringField()
    inheritRoom = db.BoolField(default=False)
    title = db.StringField()
    location = db.StringField()
    uniqueId = db.StringField(default='')
    contribDuration = db.AnythingField(default='')
    duration = db.IntField(default=0)
    textColor = db.StringField(default='')
    _type = db.StringField()
    description = db.StringField()
    material = db.ListField(db.DocumentField('Material'))
    presenters = db.ListField(db.DocumentField('Presenter'))
    _fossil = db.StringField()
    sessionCode = db.AnythingField()
    conveners = db.StringField()
    entryType = db.StringField()
    room = db.StringField()
    isPoster = db.BoolField(default=False)
    sessionId = db.AnythingField()
    slotTitle = db.StringField(default='')
    eventId = db.AnythingField()
    dayDate = db.StringField()
    numContributions = db.IntField()


class Chair(DBClass):
    _type = db.StringField()
    id = db.AnythingField()
    affiliation = db.StringField()
    _fossil = db.StringField()
    fullName = db.StringField()
    email = db.StringField()
    eventId = db.AnythingField()


class Day(DBClass):
    date = db.StringField()
    eventId = db.AnythingField()


class Event(DBClass):
    startDate = db.DateTimeField()
    endDate = db.DateTimeField()
    title = db.StringField()
    _type = db.StringField()
    description = db.StringField()
    id = db.StringField()
    chairs = db.ListField(db.DocumentField('Chair'))
    url = db.StringField()
    location = db.StringField()
    _fossil = db.StringField()
    timezone = db.StringField()
    type = db.StringField()
    id = db.StringField()
    room = db.AnythingField()
    category = db.StringField()
    categoryId = db.StringField()
    numContributions = db.IntField()
    numSessions = db.IntField()


class Recent_Event(DBClass):
    today = db.StringField()
    title = db.StringField()
    id = db.StringField()
    startDate = db.DateTimeField()
    part = db.AnythingField()
