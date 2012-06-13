import urllib2
import urllib
import time

from datetime import datetime, timedelta
from pytz import timezone, utc
from flask import request, json, current_app, request, jsonify
from flaskext.mongoalchemy import MongoAlchemy
from mongoalchemy.fields import DateTimeField
from mongoalchemy.session import Session as MongoSession

from indicomobile.db.schema import *
from indicomobile.db.logic import store_event, convert_dates
from indicomobile.util.date_time import dt_from_indico


events = Blueprint('events', __name__, template_folder='templates')
query_session = MongoSession.connect('library')


def get_event_info(event_id):
    event_req = urllib2.Request(current_app.config['SERVER_URL'] +
                                '/export/event/' + event_id +
                                '.json?ak=' + current_app.config['API_KEY'] + '&nocache=yes')
    event_opener = urllib2.build_opener()
    f1 = event_opener.open(event_req)
    event_info = json.load(f1)['results'][0]

    return event_info


def fetch_timetable(event_id):
    timetable_req = urllib2.Request(current_app.config['SERVER_URL'] +
                                    '/export/timetable/' + event_id +
                                    '.json?ak=' +
                                    current_app.config['API_KEY'])
    timetable_opener = urllib2.build_opener()
    f2 = timetable_opener.open(timetable_req)
    return json.load(f2)['results']


@events.before_request
def with_event():
    """
    Gets executed before every request in this blueprint
    """
    event_id = request.view_args.get('event_id')
    if event_id:
        event_http = get_event_info(event_id)
        event_db = Event.query.filter(Event.id == event_id).first()
        if not event_db:
            event_tt = fetch_timetable(event_id)
            store_event(event_http, event_tt)
        elif utc.localize(event_db.modificationDate) < dt_from_indico(event_http['modificationDate']):
            Event.cleanup(event_id)
            event_tt = fetch_timetable(event_id)
            store_event(event_http, event_tt)


def update_ongoing_events():
    url = '{0}/export/categ/0.json?ak={1}&from=now&to=now'.format(
        current_app.config['SERVER_URL'], current_app.config['API_KEY'])

    f = urllib2.urlopen(url)
    events = json.load(f)['results']

    for event in events:
        if Event.query.filter(Event.id == event['id']).count() == 0:
            # store event
            event_tt = fetch_timetable(event['id'])
            store_event(event, event_tt)


def update_future_events():
    url = '{0}/export/categ/0.json?ak={1}&from=now&limit=20'.format(
        current_app.config['SERVER_URL'], current_app.config['API_KEY'])
    f = urllib2.urlopen(url)
    events = json.load(f)['results']

    for event in events:
        if Event.query.filter(Event.id == event['id']).count() == 0:
            # store event
            event_tt = fetch_timetable(event['id'])
            store_event(event, event_tt)


@events.route('/event/<event_id>/days', methods=['GET'])
def eventDays(event_id):
    days = []
    for day in Day.query.filter(Day.eventId == event_id).ascending("date"):
        days.append(day.date)
    return json.dumps(days)


@events.route('/event/<event_id>/day/<day_date>', methods=['GET'])
def eventDay(event_id, day_date):
    day = Day.query.filter(Day.eventId == event_id,
                                          Day.date == day_date)[0]
    return json.dumps(day.fields())


@events.route('/event/<event_id>/sessions/<session_id>', methods=['GET'])
def eventSameSessions(event_id, session_id):
    sessionsDB = SessionSlot.query.filter(SessionSlot.eventId == event_id,
                                          SessionSlot.sessionId == session_id).ascending('startDate')
    sessions = []
    for session in sessionsDB:
        sessions.append(session.fields())
    return json.dumps(sessions)


@events.route('/event/<event_id>/contrib/<contrib_id>', methods=['GET'])
def eventContribution(event_id, contrib_id):
    contribution = Contribution.query.filter(Contribution.eventId == event_id,
                                             Contribution.contributionId == contrib_id)[0]
    return json.dumps(contribution.fields())


@events.route('/event/<event_id>/day/<day_date>/contributions', methods=['GET'])
def dayContributions(event_id, day_date):
    contributions = []
    first_query = Contribution.query.filter(Contribution.eventId == event_id,
                                            Contribution.dayDate == day_date).ascending('startDate')
    contribs_DB = first_query
    for contrib in contribs_DB:
        contributions.append(contrib.fields())
    return json.dumps(contributions)


@events.route('/event/<event_id>/sessions', methods=['GET'])
def eventSessions(event_id):
    sessions = {}
    event = Event.query.filter(Event.id == event_id).first()

    if not event:
        return 'Not found', 400

    slots = SessionSlot.query.filter(SessionSlot.event == event).ascending('title')

    for slot in slots:
        slot_dict = slot.fields()
        slot_dict.pop('startDate')
        slot_dict.pop('endDate')
        sessions[slot.sessionId] = slot_dict

    return json.dumps(sessions)



@events.route('/event/<event_id>/session/<session_id>/contribs', methods=['GET'])
def sessionContributions(event_id, session_id):
    contributions = []
    first_query = Contribution.query.filter(Contribution.eventId == event_id,
                                       Contribution.sessionId == session_id)
    contributions_DB = first_query
    for contribution in contributions_DB:
        contributions.append(contribution.fields())
    return json.dumps(contributions)


@events.route('/event/<event_id>/contribs', methods=['GET'])
def eventContributions(event_id):
    contributions = []
    contributions_DB = Contribution.query.filter(Contribution.eventId == event_id)
    for contribution in contributions_DB:
        contributions.append(contribution.fields())
    return json.dumps(contributions)


@events.route('/event/<event_id>/speaker/<speaker_id>/contributions', methods=['GET'])
def speakerContributions(event_id, speaker_id):
    contributions = []
    speaker = Speaker.query.filter(Presenter.eventId == event_id,
                                   Presenter.id == speaker_id)[0]
    for contrib in speaker.contributionId:
        contrib_DB = Contribution.query.filter(Contribution.eventId == event_id,
                                          Contribution.contributionId == contrib).ascending('startDate')[0]
        contributions.append(contrib_DB.fields())
    return json.dumps(contributions)


@events.route('/event/<event_id>/speakers', methods=['GET'])
def eventSpeakers(event_id):
    pageNumber = int(request.args.get('page',1))
    speakers = []
    speakers_DB = Speaker.query.filter(Speaker.eventId == event_id).skip((pageNumber - 1) * 20).limit(20)
    for speaker in speakers_DB:
        speakers.append(speaker.fields())
    return json.dumps(speakers)


@events.route('/event/<event_id>/speaker/<speaker_id>', methods=['GET'])
def eventSpeaker(event_id, speaker_id):
    speaker = Speaker.query.filter(Speaker.eventId == event_id,
                                   Speaker.id == speaker_id)[0]
    return json.dumps(speaker.fields())


@events.route('/event/<event_id>', methods=['GET'])
def eventInfo(event_id):
    event_db = Event.query.filter(Event.id == event_id).one()
    return json.dumps(event_db.fields())


@events.route('/searchEvent/', methods=['GET'])
def search_event():
    search = urllib.quote(request.args.get('search'))
    pageNumber = int(request.args.get('page',1))
    url = current_app.config['SERVER_URL'] + \
          '/export/event/search/' + search + \
          '.json?ak=' + \
          current_app.config['API_KEY']
    req = urllib2.Request(url)
    opener = urllib2.build_opener()
    f = opener.open(req)
    results = json.load(f)['results']
    results= sorted(results,
                    key=lambda k: datetime.combine(datetime.strptime(k['startDate']['date'], "%Y-%m-%d"),
                         datetime.strptime(k['startDate']['time'], "%H:%M:%S").time()))
    results.reverse()
    first_element = (pageNumber-1)*20
    return json.dumps(results[first_element:first_element+20])


@events.route('/searchSpeaker/<event_id>', methods=['GET'])
def search_speaker(event_id):
    search = urllib.quote(request.args.get('search'))
    pageNumber = int(request.args.get('page',1))
    offset = int(request.args.get('offset', 20))
    words = search.split('%20')
    regex = ''
    for word in words:
        regex += '(?=.*' + word + ')'
    speakers = Presenter.query.find({'name': {'$regex': regex, '$options': 'i'},
                                     'eventId': event_id}).sort([('name', 1)]).skip((pageNumber-1)*offset).limit(offset)
    if speakers.count() > 0:
        results = []
        for speaker in speakers:
            speaker.pop('_id')
            speaker = Presenter(**speaker)
            results.append(speaker.fields())
        return json.dumps(results)
    else:
        return json.dumps({})


@events.route('/searchContrib/event/<event_id>/day/<day_date>', methods=['GET'])
def search_contrib(event_id, day_date):
    search = urllib.quote(request.args.get('search'))
    pageNumber = int(request.args.get('page',1))
    offset = int(request.args.get('offset', 20))
    words = search.split('%20')
    regex = ''
    for word in words:
        regex += '(?=.*' + word + ')'
    contributions = Contribution.query.find({'title': {'$regex': regex, '$options': 'i'},
                                             'eventId': event_id,
                                             'dayDate': day_date}).sort([('startDate',1)])
    if contributions.count() > 0:
        results = []
        for contrib in contributions:
            contrib.pop('_id')
            contrib['presenters'] = []
            contrib['material'] = []
            contrib = Contribution(**contrib)
            results.append(contrib.fields())
        return json.dumps(results)
    else:
        return json.dumps({})


@events.route('/searchContrib/event/<event_id>/session/<session_id>/day/<day_date>', methods=['GET'])
def search_contrib_in_session(event_id, session_id, day_date):
    search = urllib.quote(request.args.get('search'))
    pageNumber = int(request.args.get('page',1))
    offset = int(request.args.get('offset', 20))
    words = search.split('%20')
    regex = ''
    for word in words:
        regex += '(?=.*' + word + ')'
    contributions = Contribution.query.find({'title': {'$regex': regex, '$options': 'i'},
                                             'eventId': event_id,
                                             'dayDate': day_date,
                                             'sessionId': session_id}).sort([('startDate',1)]).skip((pageNumber-1)*offset).limit(offset)
    if contributions.count() > 0:
        results = []
        for contrib in contributions:
            contrib.pop('_id')
            contrib['presenters'] = []
            contrib['material'] = []
            contrib = Contribution(**contrib)
            results.append(contrib.fields())
        return json.dumps(results)
    else:
        return json.dumps({})


# TODO: Cache this
@events.route('/futureEvents/<part>', methods=['GET'])
def getFutureEvents(part):
    update_future_events()
    now = datetime.utcnow()
    return json.dumps(list(Event.query.filter(Event.startDate > now).ascending(Event.startDate).limit(15)))


# TODO: Cache this
@events.route('/ongoingEvents/<part>', methods=['GET'])
def getOngoingEvents(part):
    update_ongoing_events()
    now = datetime.utcnow()
    return json.dumps(list(Event.query.filter(Event.startDate < now, Event.endDate > now)))


# TODO: Cache this
@events.route('/ongoingContributions/', methods=['GET'])
def getOngoingContributions():
    update_ongoing_events()
    now = datetime.utcnow()
    return json.dumps(Contribution.query.filter(Contribution.startDate < now, Contribution.endDate > now))
