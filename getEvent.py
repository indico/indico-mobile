import urllib2
import urllib
import simplejson
from datetime import datetime
from pytz import timezone
from flask import request, json, current_app
from dbClasses import *
from flask.ext.pymongo import PyMongo
from mongoalchemy.session import Session as MongoSession

getEvent = Blueprint('getEvent', __name__, template_folder='templates')
mongo = PyMongo(app)
query_session = MongoSession.connect('library')

""" allow datetime to be serialized to JSON """
dthandler = lambda obj: {'date': obj.strftime('%Y-%m-%d'),
                         'time': obj.strftime('%H:%M:%S'),
                         'tz': obj.strftime('%Z')} if isinstance(obj, datetime) else None


@getEvent.route('/event/<event_id>/day/<day_date>', methods=['GET'])
def eventDay(event_id, day_date):
    day = query_session.query(Day).filter(Day.eventId == event_id,
                                          Day.date == day_date)[0]
    return json.dumps(day.fields())


@getEvent.route('/event/<event_id>/session/<session_id>', methods=['GET'])
def eventSession(event_id, session_id):
    session = query_session.query(Session).filter(Session.eventId == event_id,
                                                  Session.id ==
                                                  session_id)[0]
    return json.dumps(session.fields(), default=dthandler)


@getEvent.route('/event/<event_id>/sessions/<session_id>', methods=['GET'])
def eventSameSessions(event_id, session_id):
    sessionsDB = query_session.query(Session).filter(Session.eventId == event_id,
                                                     Session.sessionId == session_id)
    sessions = []
    for session in sessionsDB:
        sessions.append(session.fields())
    return json.dumps(sessions, default=dthandler)


@getEvent.route('/event/<event_id>/session/<session_id>/contrib/<contrib_id>', methods=['GET'])
def eventContribution(event_id, session_id, contrib_id):
    contrib_query = query_session.query(Contribution)
    contribution = contrib_query.filter(Contribution.eventId == event_id,
                                        Contribution.sessionUniqueId == session_id,
                                        Contribution.contributionId == contrib_id)[0]
    return json.dumps(contribution.fields(), default=dthandler)


@getEvent.route('/event/<event_id>/day/<day_date>/contributions', methods=['GET'])
def dayContributions(event_id, day_date):
    contributions = []
    first_query = query_session.query(Contribution).filter(Contribution.eventId == event_id,
                                                      Contribution.dayDate == day_date)
    contribs_DB = first_query
    for contrib in contribs_DB:
        if contrib.sessionTitle != 'Poster session':
            contributions.append(contrib.fields())
    return json.dumps(contributions, default=dthandler)


@getEvent.route('/event/<event_id>/sessions', methods=['GET'])
def eventSessions(event_id):
    sessions = []
    is_event_in_DB = query_session.query(Event).filter(Event.id == event_id)
    if is_event_in_DB.count() == 0:
        addEventToDB(event_id)
    first_query = query_session.query(Session).filter(Session.eventId == event_id)
    sessions_DB = first_query
    for session in sessions_DB:
        sessions.append(session.fields())
    return json.dumps(sessions, default=dthandler)


@getEvent.route('/event/<event_id>/session/<session_id>/contribs', methods=['GET'])
def sessionContributions(event_id, session_id):
    contributions = []
    contrib_query = query_session.query(Contribution)
    first_query = contrib_query.filter(Contribution.eventId == event_id,
                                       Contribution.sessionId == session_id)
    contributions_DB = first_query
    for contribution in contributions_DB:
        print contribution.fields()
        contributions.append(contribution.fields())
    return json.dumps(contributions, default=dthandler)


@getEvent.route('/event/<event_id>/contribs', methods=['GET'])
def eventContributions(event_id):
    contributions = []
    contrib_query = query_session.query(Contribution)
    contributions_DB = contrib_query.filter(Contribution.eventId == event_id)
    for contribution in contributions_DB:
        contributions.append(contribution.fields())
    return json.dumps(contributions, default=dthandler)


@getEvent.route('/event/<event_id>/speaker/<speaker_id>/contributions', methods=['GET'])
def speakerContributions(event_id, speaker_id):
    contributions = []
    speaker_query = query_session.query(Presenter)
    speaker = speaker_query.filter(Presenter.eventId == event_id,
                                   Presenter.id == speaker_id)[0]
    for contrib in speaker.contributionId:
        contrib_query = query_session.query(Contribution)
        contrib_DB = contrib_query.filter(Contribution.eventId == event_id,
                                       Contribution.contributionId == contrib)[0]
        print contrib_DB
        contributions.append(contrib_DB.fields())
    return json.dumps(contributions, default=dthandler)


@getEvent.route('/event/<event_id>/speakers', methods=['GET'])
def eventSpeakers(event_id):
    speakers = []
    speaker_query = query_session.query(Presenter)
    speakers_DB = speaker_query.filter(Presenter.eventId == event_id)
    for speaker in speakers_DB:
        speakers.append(speaker.fields())
    return json.dumps(speakers, default=dthandler)


@getEvent.route('/event/<event_id>/speaker/<speaker_id>', methods=['GET'])
def eventSpeaker(event_id, speaker_id):
    speaker_query = query_session.query(Presenter)
    speaker = speaker_query.filter(Presenter.eventId == event_id,
                                   Presenter.id == speaker_id)[0]
    return json.dumps(speaker.fields(), default=dthandler)


def addEventToDB(event_id):
    event_req = urllib2.Request(current_app.config['PROTOCOL_SPECIFIER'] +
                                '://' + current_app.config['SERVER_URL'] +
                                '/export/event/' + event_id +
                                '.json?ak=' + current_app.config['API_KEY'])
    event_opener = urllib2.build_opener()
    f1 = event_opener.open(event_req)
    event_info = simplejson.load(f1)
    timetable_req = urllib2.Request(current_app.config['PROTOCOL_SPECIFIER'] +
                                    '://' + current_app.config['SERVER_URL'] +
                                    '/export/timetable/' + event_id +
                                    '.json?ak=' +
                                    current_app.config['API_KEY'])
    timetable_opener = urllib2.build_opener()
    f2 = timetable_opener.open(timetable_req)
    event_tt = simplejson.load(f2)
    current_event = event_info['results'][0]
    manage_event(current_event, event_tt, event_id)


def manage_event(event, event_tt, event_id):
    number_contributions = 0
    number_sessions = 0
    presenter_id = Presenter_id()
    for day in event_tt['results'][event_id]:
        current_day = event_tt['results'][event_id][day]
        if current_day:
            day_date = ''
            for session in current_day:
                current_session = current_day[session]
                current_session['eventId'] = event['id']
                if day_date == '':
                    day_date = current_session['startDate']['date']
                contributions = 0
                if 'entries' in current_session:
                    for contribution in current_session['entries']:
                        current_contribution = current_session['entries'][contribution]
                        convert_dates(current_contribution)
                        manage_material(current_contribution)
                        manage_presenters(current_contribution, current_session['eventId'], current_contribution['id'], presenter_id)
                        current_contribution['sessionId'] = current_session['sessionId']
                        current_contribution['sessionUniqueId'] = current_session['id']
                        current_contribution['sessionTitle'] = current_session['title']
                        current_contribution['contributionId'] = current_contribution.pop('id')
                        current_contribution['eventId'] = current_session['eventId']
                        current_contribution['dayDate'] = day_date
                        db_contribution = Contribution(**current_contribution)
                        db_contribution.save()
                        contributions = contributions + 1
                        number_contributions = number_contributions + 1
                    current_session.pop('entries')
                current_session['numContributions'] = contributions
                current_session['dayDate'] = day_date
                convert_dates(current_session)
                manage_material(current_session)
                manage_presenters(current_session, current_session['eventId'], current_session['id'], presenter_id)
                current_session['conveners'] = ''
                db_session = Session(**current_session)
                db_session.save()
                number_sessions = number_sessions + 1
            db_day = Day(date=day_date, eventId=event['id'])
            db_day.save()
    numSessions = query_session.query(Session).filter({'_type': {'$ne': 'BreakTimeSchEntry'}, 'eventId': event_id})
    event['numSessions'] = len(numSessions.distinct('title'))
    event['numContributions'] = number_contributions
    session_contribs_number(event['id'])
    manage_chairs(event)
    convert_dates(event)
    db_event = Event(**event)
    db_event.save()


def session_contribs_number(event_id):
    sessions = query_session.query(Session).filter({'eventId': event_id})
    for session in sessions:
        print session.sessionId
        contribs = query_session.query(Contribution).filter({'sessionId': session.sessionId,
                                                             'eventId': event_id}).count()
        query_session.query(Session).filter({'eventId': event_id, 'sessionId': session.sessionId}).set(Session.numContributions, contribs).multi().execute()


def manage_chairs(dictionary):
    if 'chairs' in dictionary:
        chairs = []
        chairs_dict = dictionary.pop('chairs')
        for chair in chairs_dict:
            chair['eventId'] = dictionary['id']
            a_chair = Chair(**chair)
            a_chair.save()
            chairs.append(a_chair)
        dictionary['chairs'] = chairs
    else:
        dictionary['chairs'] = []


def manage_presenters(dictionary, event_id, contribution_id, presenter_id):
    if 'presenters' in dictionary:
        presenters = []
        presenters_dict = dictionary.pop('presenters')
        for presenter in presenters_dict:
            is_presenter_in_DB = query_session.query(Presenter).filter(Presenter.eventId == event_id,
                                                                       Presenter.name == presenter['name'])
            if (is_presenter_in_DB.count() > 0):
                is_presenter_in_DB.append(Presenter.contributionId, contribution_id).execute()
                presenters.append(is_presenter_in_DB[0])
            else:
                presenter['eventId'] = event_id
                presenter['id'] = str(presenter_id())
                presenter['contributionId'] = [contribution_id]
                a_presenter = Presenter(**presenter)
                a_presenter.save()
                presenters.append(a_presenter)
        dictionary['presenters'] = presenters
    else:
        dictionary['presenters'] = []


def manage_material(dictionary):
    if 'material' in dictionary:
        materials = []
        material_dict = dictionary.pop('material')
        for material in material_dict:
            manage_resource(material)
            a_material = Material(**material)
            a_material.save()
            materials.append(a_material)
        dictionary['material'] = materials
    else:
        dictionary['material'] = []


def manage_resource(dictionary):
    if 'resources' in dictionary:
        resources = []
        for resource in dictionary['resources']:
            a_resource = Resource(**resource)
            a_resource.save()
            resources.append(a_resource)
        dictionary['resources'] = resources
    else:
        dictionary['resources'] = []


def convert_dates(dictionary):
    start_date = dictionary.pop('startDate')
    converted_start_date = convert_date(start_date)
    dictionary['startDate'] = converted_start_date
    end_date = dictionary.pop('endDate')
    converted_end_date = convert_date(end_date)
    dictionary['endDate'] = converted_end_date


def convert_date(date):
    d = datetime.combine(datetime.strptime(date['date'], "%Y-%m-%d"),
                         datetime.strptime(date['time'], "%H:%M:%S").time())
    return timezone(date['tz']).localize(d)


@getEvent.route('/event/<event_id>', methods=['GET'])
def eventInfo(event_id):
    is_event_in_DB = query_session.query(Event).filter(Event.id == event_id)
    if is_event_in_DB.count() > 0:
        event = is_event_in_DB[0]
        return json.dumps(event.fields(), default=dthandler)
    else:
        req = urllib2.Request(current_app.config['PROTOCOL_SPECIFIER'] +
                              '://' + current_app.config['SERVER_URL'] +
                              '/export/event/' + event_id +
                              '.json?ak=' +
                              current_app.config['API_KEY'])
        opener = urllib2.build_opener()
        f = opener.open(req)
        return json.dumps(simplejson.load(f)['results'])


@getEvent.route('/searchEvent', methods=['GET'])
def search_event():
    search = urllib.quote(request.args.get('search'))
    url = current_app.config['PROTOCOL_SPECIFIER'] + \
          '://' + current_app.config['SERVER_URL'] + \
          '/export/event/search/' + search + \
          '.json?ak=' + \
          current_app.config['API_KEY']
    req = urllib2.Request(url)
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.dumps(simplejson.load(f)['results'])

@getEvent.route('/searchSpeaker/<event_id>', methods=['GET'])
def search_speaker(event_id):
    search = urllib.quote(request.args.get('search'))
    if query_session.db.Presenter.find({'name': {'$regex': search, '$options': 'i'},
                                        'eventId': event_id}).count() > 0:
        speakers = query_session.db.Presenter.find({'name': {'$regex': search, '$options': 'i'},
                                                    'eventId': event_id})
        results = []
        for speaker in speakers:
            speaker.pop('_id')
            speaker = Presenter(**speaker)
            results.append(speaker.fields())
        return json.dumps(results)
    else:
        return json.dumps({})


@getEvent.route('/futureEvents/<part>', methods=['GET'])
def getFutureEvents(part):
    req = urllib2.Request(current_app.config['PROTOCOL_SPECIFIER'] +
                          '://' + current_app.config['SERVER_URL'] +
                          '/export/categ/0.json?ak=' +
                          current_app.config['API_KEY'] +
                          '&from=today&pretty=yes&limit=' + part)
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.dumps(simplejson.load(f))
