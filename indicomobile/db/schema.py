from flask import Flask, Blueprint
from flaskext.mongoalchemy import MongoAlchemy

from indicomobile.db.base import DBClass, db


class Presenter(DBClass):
    _fossil = db.StringField()
    affiliation = db.StringField()
    _type = db.StringField()
    name = db.StringField()
    familyName = db.StringField()
    firstName = db.StringField()
    name = db.StringField()
    contributionId = db.ListField(db.AnythingField())
    eventId = db.AnythingField()
    email = db.AnythingField()
    id = db.AnythingField()


class Resource(DBClass):
    url = db.StringField()
    _fossil = db.StringField()
    _type = db.StringField()
    name = db.StringField()
    eventId = db.AnythingField()


class Material(DBClass):
    _fossil = db.StringField()
    _type = db.StringField()
    id = db.StringField()
    title = db.StringField()
    resources = db.ListField(db.DocumentField('Resource'))
    eventId = db.AnythingField()


class Contribution(DBClass):
    _type = db.StringField()
    startDate = db.DateTimeField()
    sessionSlotId = db.AnythingField()
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
    sessionId = db.AnythingField()
    sessionUniqueId = db.AnythingField()
    location = db.StringField()
    uniqueId = db.StringField()
    _fossil = db.StringField()
    sessionCode = db.AnythingField()
    uniqueId = db.StringField(default='')
    room = db.StringField()
    isPoster = db.BoolField(default=False)
    eventId = db.AnythingField()
    dayDate = db.StringField()


class Session(DBClass):
    id = db.StringField()
    startDate = db.DateTimeField()
    sessionSlotId = db.AnythingField()
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
    location = db.AnythingField()
    _fossil = db.StringField()
    timezone = db.StringField()
    type = db.StringField()
    id = db.StringField()
    room = db.AnythingField()
    category = db.StringField()
    categoryId = db.StringField()
    numContributions = db.IntField()
    numSessions = db.IntField()
    modificationDate = db.DateTimeField()


class Recent_Event(DBClass):
    today = db.DateTimeField()
    title = db.StringField()
    id = db.StringField()
    startDate = db.DateTimeField()
    endDate = db.DateTimeField()


class Ongoing_Event(DBClass):
    today = db.DateTimeField()
    title = db.StringField()
    id = db.StringField()
    startDate = db.DateTimeField()
    endDate = db.DateTimeField()


class Ongoing_Contribution(DBClass):
    now = db.DateTimeField()
    url = db.StringField()
    track = db.AnythingField(default='')
    _type = db.StringField()
    type = db.AnythingField()
    room = db.AnythingField()
    contributionId = db.AnythingField()
    eventId = db.AnythingField()
    _fossil = db.StringField()
    session = db.AnythingField(default='')
    location = db.AnythingField()
    description = db.StringField()
    title = db.StringField()
    duration = db.AnythingField(default=0)
    startDate = db.DateTimeField()
    speakers = db.ListField(db.DocumentField('Presenter'))
    material = db.ListField(db.DocumentField('Material'))
    endDate = db.DateTimeField()
    category = db.AnythingField(default='')
    categoryId = db.AnythingField(default='')
    timezone = db.AnythingField(default='')
    contributions = db.AnythingField(default='')
