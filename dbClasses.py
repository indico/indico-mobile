from flask import Flask, Blueprint
from flaskext.mongoalchemy import MongoAlchemy, BaseQuery

db_classes = Blueprint('db_classes', __name__, template_folder='templates')
app = Flask(__name__)
app.config['MONGOALCHEMY_DATABASE'] = 'library'

db = MongoAlchemy(app)

class EventIdQuery(BaseQuery):

    def getEventById(self, eventID):
        return self.filter(self.type.id == eventID)

class Date(db.Document):
    date = db.StringField()
    tz = db.StringField()
    time = db.StringField()

class Presenter(db.Document):
    _fossil = db.StringField()
    affiliation = db.StringField()
    _type = db.StringField()
    name = db.StringField()

class Resource(db.Document):
    url = db.StringField()
    _fossil = db.StringField()
    _type = db.StringField()
    name = db.StringField()

class Material(db.Document):
    _fossil = db.StringField()
    _type = db.StringField()
    id = db.StringField()
    title = db.StringField()
    resources = db.ListField(db.DocumentField('Resource'))

class Contribution(db.Document):
    _type = db.StringField()
    startDate = db.DateTimeField()
    sessionSlotId = db.StringField()
    contributionId = db.StringField(default='')
    endDate = db.DateTimeField()
    description = db.StringField()
    title = db.StringField()
    material = db.ListField(db.DocumentField('Material'))
    conferenceId = db.StringField()
    entryType = db.StringField()
    color = db.StringField(default='')
    textColor = db.StringField(default='')
    duration = db.IntField(default=0)
    presenters = db.ListField(db.DocumentField('Presenter'))
    sessionId = db.StringField()
    location = db.StringField()
    uniqueId = db.StringField()
    _fossil = db.StringField()
    sessionCode = db.StringField()
    uniqueId = db.StringField(default='')
    id = db.StringField()
    room = db.StringField()

class Session(db.Document):
    startDate = db.DateTimeField()
    sessionSlotId = db.AnythingField()
    contributionId = db.AnythingField(default='')
    endDate = db.DateTimeField()
    color = db.StringField(default='')
    conferenceId = db.StringField()
    inheritLoc = db.BoolField(default=False)
    id = db.StringField()
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
    contributions = db.ListField(db.DocumentField('Contribution'))

class Chair(db.Document):
    _type = db.StringField()
    id = db.AnythingField()
    affiliation = db.StringField()
    _fossil = db.StringField()
    fullName = db.StringField()
    email = db.StringField()

class Day(db.Document):
    query_class = EventIdQuery
    date = db.StringField()
    sessions = db.ListField(db.DocumentField('Session'))

class Event(db.Document):
    query_class = EventIdQuery
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
    days = db.ListField(db.DocumentField('Day'))