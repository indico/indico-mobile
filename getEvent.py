import urllib2
import simplejson
from datetime import datetime
from flask import request, json, current_app
from dbClasses import *
from flask.ext.pymongo import PyMongo
from mongoalchemy.session import Session as MongoSession

getEvent = Blueprint('getEvent', __name__, template_folder='templates')
mongo = PyMongo(app)
query_session = MongoSession.connect('library')

""" allow datetime to be serialized to JSON """
dthandler = lambda obj: {'date': obj.strftime('%Y-%m-%d'),
                         'time': obj.strftime('%H:%M:%S')} if isinstance(obj, datetime) else None


def presentersToJSON(dictionary):
    new_presenters = []
    if 'presenters' in dictionary:
        for presenter in dictionary['presenters']:
            presenter.fields()
            new_presenters.append(presenter._field_values)
    dictionary['presenters'] = new_presenters


def materialsToJSON(dictionary):
    new_materials = []
    if 'material' in dictionary:
        for material in dictionary['material']:
            material.fields()
            resources = []
            for resource in material._field_values['resources']:
                resource.fields()
                resources.append(resource._field_values)
            material._field_values['resources'] = resources
            new_materials.append(material._field_values)
    dictionary['material'] = new_materials


@getEvent.route('/event/<event_id>/days', methods=['GET'])
def eventDays(event_id):
    is_event_in_DB = query_session.query(Event).filter(Event.id == event_id)
    if is_event_in_DB.count() == 0:
        addEventToDB(event_id)
    days = []
    for day in query_session.query(Day).filter(Day.eventId == event_id):
        days.append(day.fields())
    return json.dumps(days)


@getEvent.route('/event/<event_id>/day/<day_date>', methods=['GET'])
def eventDay(event_id, day_date):
    day = query_session.query(Day).filter(Day.eventId == event_id,
                                          Day.date == day_date)[0]
    return json.dumps(day.fields())


@getEvent.route('/event/<event_id>/day/<day_date>/session/<session_id>', methods=['GET'])
def eventSession(event_id, day_date, session_id):
    session = query_session.query(Session).filter(Session.eventId == event_id,
                                                  Session.dayDate == day_date,
                                                  Session.sessionId ==
                                                  session_id)[0]
    session_values = session._field_values
    presentersToJSON(session_values)
    materialsToJSON(session_values)
    return json.dumps(session.fields(), default=dthandler)


@getEvent.route('/event/<event_id>/day/<day_date>/session/<session_id>/contrib/<contrib_id>', methods=['GET'])
def eventContribution(event_id, day_date, session_id, contrib_id):
    contrib_query = query_session.query(Contribution)
    contribution = contrib_query.filter(Contribution.eventId == event_id,
                                        Contribution.dayDate == day_date,
                                        Contribution.sessionId == session_id,
                                        Contribution.contributionId == contrib_id)[0]
    contrib_values = contribution._field_values
    presentersToJSON(contrib_values)
    materialsToJSON(contrib_values)
    return json.dumps(contribution.fields(), default=dthandler)


@getEvent.route('/event/<event_id>/day/<day_date>/sessions', methods=['GET'])
def daySessions(event_id, day_date):
    sessions = []
    first_query = query_session.query(Session).filter(Session.eventId == event_id,
                                                      Session.dayDate == day_date)
    sessions_DB = first_query
    for session in sessions_DB:
        session_values = session._field_values
        presentersToJSON(session_values)
        materialsToJSON(session_values)
        sessions.append(session.fields())
    return json.dumps(sessions, default=dthandler)


@getEvent.route('/event/<event_id>/sessions', methods=['GET'])
def eventSessions(event_id):
    sessions = []
    first_query = query_session.query(Session).filter(Session.eventId == event_id)
    sessions_DB = first_query
    for session in sessions_DB:
        session_values = session._field_values
        presentersToJSON(session_values)
        materialsToJSON(session_values)
        sessions.append(session.fields())
    return json.dumps(sessions, default=dthandler)


@getEvent.route('/event/<event_id>/day/<day_date>/session/<session_id>/contribs', methods=['GET'])
def sessionContributions(event_id, day_date, session_id):
    contributions = []
    contrib_query = query_session.query(Contribution)
    first_query = contrib_query.filter(Contribution.eventId == event_id,
                                       Contribution.dayDate == day_date,
                                       Contribution.sessionId == session_id)
    contributions_DB = first_query
    for contribution in contributions_DB:
        contrib_values = contribution._field_values
        presentersToJSON(contrib_values)
        materialsToJSON(contrib_values)
        contributions.append(contribution.fields())
    return json.dumps(contributions, default=dthandler)


@getEvent.route('/event/<event_id>/contribs', methods=['GET'])
def eventContributions(event_id):
    contributions = []
    contrib_query = query_session.query(Contribution)
    contributions_DB = contrib_query.filter(Contribution.eventId == event_id)
    print contributions_DB.count()
    for contribution in contributions_DB:
        contrib_values = contribution._field_values
        presentersToJSON(contrib_values)
        materialsToJSON(contrib_values)
        contributions.append(contribution.fields())
    return json.dumps(contributions, default=dthandler)


def addEventToDB(event_id):
    event_req = urllib2.Request('http://' + current_app.config['SERVER_URL'] +
                                '/indico/export/event/' + event_id +
                                '.json?ak=' + current_app.config['API_KEY'])
    event_opener = urllib2.build_opener()
    f1 = event_opener.open(event_req)
    event_info = simplejson.load(f1)
    timetable_req = urllib2.Request('http://' +
                                    current_app.config['SERVER_URL'] +
                                    '/indico/export/timetable/' + event_id +
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
                        manage_presenters(current_contribution)
                        current_contribution['sessionId'] = current_session['id']
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
                manage_presenters(current_session)
                current_session['conveners'] = ''
                current_session['sessionId'] = current_session.pop('id')
                db_session = Session(**current_session)
                db_session.save()
                number_sessions = number_sessions + 1
            db_day = Day(date=day_date, eventId=event['id'])
            db_day.save()
    event['numSessions'] = number_sessions
    event['numContributions'] = number_contributions
    manage_chairs(event)
    convert_dates(event)
    db_event = Event(**event)
    db_event.save()


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


def manage_presenters(dictionary):
    if 'presenters' in dictionary:
        presenters = []
        presenters_dict = dictionary.pop('presenters')
        for presenter in presenters_dict:
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
        for resource in dict['resources']:
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
    string_date = date['date'] + "T" + date['time']
    new_date = datetime.now()
    return new_date.strptime(string_date, '%Y-%m-%dT%H:%M:%S')


@getEvent.route('/event/<event_id>', methods=['GET'])
def eventInfo(event_id):
    is_event_in_DB = query_session.query(Event).filter(Event.id == event_id)
    if is_event_in_DB.count() > 0:
        event = is_event_in_DB[0]
        chairs = []
        for chair in event._field_values['chairs']:
            chair.fields()
            chairs.append(chair._field_values)
        event._field_values['chairs'] = chairs
        event.fields()
        return json.dumps(event._field_values, default=dthandler)
    else:
        req = urllib2.Request('http://' + current_app.config['SERVER_URL'] +
                              '/indico/export/event/' + event_id +
                              '.json?ak=' +
                              current_app.config['API_KEY'])
        opener = urllib2.build_opener()
        f = opener.open(req)
        return json.dumps(simplejson.load(f)['results'])


@getEvent.route('/searchEvent', methods=['GET'])
def searchEvent():
    search = request.args.get('search')
    search_result = query_session.db.Event.find({'title': {'$regex': search, '$options': 'i'}},
                                                {'_id': 0, 'id': 1, 'title': 1, 'startDate': 1})
    if search_result.count() > 0:
        results = []
        for event in search_result:
            results.append(event)
        return json.dumps(results, default=dthandler)
    else:
        return json.dumps({})


@getEvent.route('/futureEvents', methods=['GET'])
def getFutureEvents():
    part = request.args.get('part')
    req = urllib2.Request('http://' + current_app.config['SERVER_URL'] +
                          '/indico/export/categ/0.json?ak=' +
                          current_app.config['API_KEY'] +
                          '&from=today&pretty=yes&limit=10&offset=' + part)
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.dumps(simplejson.load(f))


@getEvent.route('/pastEvents', methods=['GET'])
def getPastEvent():
    part = request.args.get('part')
    req = urllib2.Request('http://' + current_app.config['SERVER_URL'] +
                          '/indico/export/categ/0.json?ak=' +
                          current_app.config['API_KEY'] +
                          '&from=-30d&to=today&pretty=yes&limit=10&offset=' + part)
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.dumps(simplejson.load(f))


@getEvent.route('/futureEvent2', methods=['GET'])
def getFutureEvent2():
    part = request.args.get('part')
    req = urllib2.Request('http://' + current_app.config['SERVER_URL'] +
                          '/indico/export/categ/0.json?ak=' +
                          current_app.config['API_KEY'] +
                          '&from=today&pretty=yes&limit=' + part)
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.dumps(simplejson.load(f))


@getEvent.route('/pastEvent2', methods=['GET'])
def getPastEvent2():
    part = request.args.get('part')
    req = urllib2.Request('http://' + current_app.config['SERVER_URL'] +
                          '/indico/export/categ/0.json?ak=' +
                          current_app.config['API_KEY'] +
                          '&from=-30d&to=today&pretty=yes&limit=' + part)
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.dumps(simplejson.load(f))
