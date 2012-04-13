import urllib2, simplejson, jsonpickle, inspect
from datetime import datetime, tzinfo,time
from time import strptime
from flask import Flask, Blueprint, render_template, request, json, current_app
from dbClasses import *
from flask.ext.pymongo import PyMongo
from mongoalchemy.session import Session as MongoSession

getEvent = Blueprint('getEvent', __name__, template_folder='templates')
mongo = PyMongo(app)
query_session = MongoSession.connect('library')


@getEvent.route('/eventDays', methods=['GET'])
def eventDays():
    event_id = request.args.get('eventID')
    isEventInDB = query_session.query(Event).filter(Event.id==event_id)
    if isEventInDB.count()==0:
        addEventToDB(event_id)
    days = []
    for day in query_session.query(Day).filter(Day.eventId == event_id):
        day._field_values.pop('mongo_id')
        days.append(day._field_values)
    return json.dumps(days)

@getEvent.route('/eventDay', methods=['GET'])
def eventDay():
    event_id = request.args.get('eventID')
    day_date = request.args.get('dayDate')
    day = query_session.query(Day).filter(Day.eventId==event_id, Day.date==day_date)[0]
    day._field_values.pop('mongo_id')
    return json.dumps(day._field_values)

@getEvent.route('/eventSession', methods=['GET'])
def eventSession():
    event_id = request.args.get('eventID')
    day_date = request.args.get('dayDate')
    session_id = request.args.get('sessionId')
    session = query_session.query(Session).filter(Session.eventId==event_id,
                                              Session.dayDate==day_date,
                                              Session.sessionId==session_id)[0]
    presenters = []
    for presenter in session._field_values['presenters']:
        presenter._field_values.pop('mongo_id')
        presenters.append(presenter._field_values)
    session._field_values['presenters'] = presenters
    materials = []
    for material in session._field_values['material']:
        material._field_values.pop('mongo_id')
        resources = []
        for resource in material._field_values['resources']:
            resource._field_values.pop('mongo_id')
            resources.append(resource._field_values)
        material._field_values['resources']=resources
        materials.append(material._field_values)
    session._field_values['material'] = materials
    start_date = session._field_values.pop('startDate')
    session._field_values['startDate'] = {'date':start_date.strftime('%Y-%m-%d') , 'time':start_date.strftime('%H:%M:%S')}
    end_date = session._field_values.pop('endDate')
    session._field_values['endDate'] = {'date':end_date.strftime('%Y-%m-%d') , 'time':end_date.strftime('%H:%M:%S')}
    session._field_values.pop('mongo_id')
    return json.dumps(session._field_values)

@getEvent.route('/eventContribution', methods=['GET'])
def eventContribution():
    event_id = request.args.get('eventID')
    day_date = request.args.get('dayDate')
    session_id = request.args.get('sessionId')
    contribution_id = request.args.get('contributionId')
    contribution = query_session.query(Contribution).filter(Contribution.eventId==event_id,
                                                   Contribution.dayDate==day_date,
                                                   Contribution.sessionId==session_id,
                                                   Contribution.contributionId == contribution_id)[0]
    presenters = []
    for presenter in contribution._field_values['presenters']:
        presenter._field_values.pop('mongo_id')
        presenters.append(presenter._field_values)
    contribution._field_values['presenters'] = presenters
    materials = []
    for material in contribution._field_values['material']:
        material._field_values.pop('mongo_id')
        resources = []
        for resource in material._field_values['resources']:
            resource._field_values.pop('mongo_id')
            resources.append(resource._field_values)
        material._field_values['resources']=resources
        materials.append(material._field_values)
    contribution._field_values['material'] = materials
    start_date = contribution._field_values.pop('startDate')
    contribution._field_values['startDate'] = {'date':start_date.strftime('%Y-%m-%d') , 'time':start_date.strftime('%H:%M:%S')}
    end_date = contribution._field_values.pop('endDate')
    contribution._field_values['endDate'] = {'date':end_date.strftime('%Y-%m-%d') , 'time':end_date.strftime('%H:%M:%S')}
    contribution._field_values.pop('mongo_id')
    return json.dumps(contribution._field_values)

@getEvent.route('/daySessions', methods=['GET'])
def daySessions():
    event_id = request.args.get('eventID')
    day_date = request.args.get('day')
    sessions = []
    first_query = query_session.query(Session).filter(Session.eventId == event_id, Session.dayDate == day_date)
    sessionsDB = first_query
    for session in sessionsDB:
        presenters = []
        for presenter in session._field_values['presenters']:
            presenter._field_values.pop('mongo_id')
            presenters.append(presenter._field_values)
        session._field_values['presenters'] = presenters
        materials = []
        for material in session._field_values['material']:
            material._field_values.pop('mongo_id')
            resources = []
            for resource in material._field_values['resources']:
                resource._field_values.pop('mongo_id')
                resources.append(resource._field_values)
            material._field_values['resources']=resources
            materials.append(material._field_values)
        session._field_values['material'] = materials
        start_date = session._field_values.pop('startDate')
        session._field_values['startDate'] = {'date':start_date.strftime('%Y-%m-%d') , 'time':start_date.strftime('%H:%M:%S')}
        end_date = session._field_values.pop('endDate')
        session._field_values['endDate'] = {'date':end_date.strftime('%Y-%m-%d') , 'time':end_date.strftime('%H:%M:%S')}
        session._field_values.pop('mongo_id')
        sessions.append(session._field_values)
    return json.dumps(sessions)

@getEvent.route('/eventSessions', methods=['GET'])
def eventSessions():
    event_id = request.args.get('eventID')
    sessions = []
    first_query = query_session.query(Session).filter(Session.eventId == event_id)
    sessionsDB = first_query
    for session in sessionsDB:
        presenters = []
        for presenter in session._field_values['presenters']:
            presenter._field_values.pop('mongo_id')
            presenters.append(presenter._field_values)
        session._field_values['presenters'] = presenters
        materials = []
        for material in session._field_values['material']:
            material._field_values.pop('mongo_id')
            resources = []
            for resource in material._field_values['resources']:
                resource._field_values.pop('mongo_id')
                resources.append(resource._field_values)
            material._field_values['resources']=resources
            materials.append(material._field_values)
        session._field_values['material'] = materials
        start_date = session._field_values.pop('startDate')
        session._field_values['startDate'] = {'date':start_date.strftime('%Y-%m-%d') , 'time':start_date.strftime('%H:%M:%S')}
        end_date = session._field_values.pop('endDate')
        session._field_values['endDate'] = {'date':end_date.strftime('%Y-%m-%d') , 'time':end_date.strftime('%H:%M:%S')}
        session._field_values.pop('mongo_id')
        sessions.append(session._field_values)
    return json.dumps(sessions)

@getEvent.route('/sessionContributions', methods=['GET'])
def sessionContributions():
    event_id = request.args.get('eventID')
    day_date = request.args.get('day')
    session_id = request.args.get('sessionId')
    contributions = []
    first_query = query_session.query(Contribution).filter(Contribution.eventId == event_id, Contribution.dayDate == day_date, Contribution.sessionId == session_id)
    contributionsDB = first_query
    for contribution in contributionsDB:
        presenters = []
        for presenter in contribution._field_values['presenters']:
            presenter._field_values.pop('mongo_id')
            presenters.append(presenter._field_values)
        contribution._field_values['presenters'] = presenters
        materials = []
        for material in contribution._field_values['material']:
            material._field_values.pop('mongo_id')
            resources = []
            for resource in material._field_values['resources']:
                resource._field_values.pop('mongo_id')
                resources.append(resource._field_values)
            material._field_values['resources']=resources
            materials.append(material._field_values)
        contribution._field_values['material'] = materials
        start_date = contribution._field_values.pop('startDate')
        contribution._field_values['startDate'] = {'date':start_date.strftime('%Y-%m-%d') , 'time':start_date.strftime('%H:%M:%S')}
        end_date = contribution._field_values.pop('endDate')
        contribution._field_values['endDate'] = {'date':end_date.strftime('%Y-%m-%d') , 'time':end_date.strftime('%H:%M:%S')}
        contribution._field_values.pop('mongo_id')
        contributions.append(contribution._field_values)
    return json.dumps(contributions)

@getEvent.route('/eventContributions', methods=['GET'])
def eventContributions():
    event_id = request.args.get('eventID')
    contributions = []
    first_query = query_session.query(Contribution).filter(Contribution.eventId == event_id)
    contributionsDB = first_query
    for contribution in contributionsDB:
        presenters = []
        for presenter in contribution._field_values['presenters']:
            presenter._field_values.pop('mongo_id')
            presenters.append(presenter._field_values)
        contribution._field_values['presenters'] = presenters
        materials = []
        for material in contribution._field_values['material']:
            material._field_values.pop('mongo_id')
            resources = []
            for resource in material._field_values['resources']:
                resource._field_values.pop('mongo_id')
                resources.append(resource._field_values)
            material._field_values['resources']=resources
            materials.append(material._field_values)
        contribution._field_values['material'] = materials
        start_date = contribution._field_values.pop('startDate')
        contribution._field_values['startDate'] = {'date':start_date.strftime('%Y-%m-%d') , 'time':start_date.strftime('%H:%M:%S')}
        end_date = contribution._field_values.pop('endDate')
        contribution._field_values['endDate'] = {'date':end_date.strftime('%Y-%m-%d') , 'time':end_date.strftime('%H:%M:%S')}
        contribution._field_values.pop('mongo_id')
        contributions.append(contribution._field_values)
    return json.dumps(contributions)

def addEventToDB(event_id):
    event_req = urllib2.Request('http://'+current_app.config['SERVER_URL']+'/indico/export/event/'+event_id+'.json?ak='+current_app.config['API_KEY'])
    event_opener = urllib2.build_opener()
    f1 = event_opener.open(event_req)
    event_info = simplejson.load(f1)
    timetable_req = urllib2.Request('http://'+current_app.config['SERVER_URL']+'/indico/export/timetable/'+event_id+'.json?ak='+current_app.config['API_KEY'])
    timetable_opener = urllib2.build_opener()
    f2 = timetable_opener.open(timetable_req)
    event_tt = simplejson.load(f2)
    current_event = event_info['results'][0]
    manage_event(current_event, event_tt, event_id)

def manage_event(event, event_tt, event_id):
    number_contributions = 0
    number_sessions = 0
    for day in event_tt['results'][event_id]:
        current_day=event_tt['results'][event_id][day]
        if current_day:
            day_date=''
            for session in current_day:
                current_session = current_day[session]
                current_session['eventId']=event['id']
                if day_date == '':
                    day_date = current_session['startDate']['date']
                contributions = 0
                if current_session.has_key('entries'):
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
                        contributions = contributions+1
                        number_contributions = number_contributions+1
                    current_session.pop('entries')
                current_session['numContributions']=contributions
                current_session['dayDate']=day_date
                convert_dates(current_session)
                manage_material(current_session)
                manage_presenters(current_session)
                current_session['conveners']=''
                current_session['sessionId'] = current_session.pop('id')
                db_session = Session(**current_session)
                db_session.save()
                number_sessions = number_sessions + 1
            db_day = Day(date=day_date, eventId=event['id'])
            db_day.save()
    event['numSessions']=number_sessions
    event['numContributions']=number_contributions
    manage_chairs(event)
    convert_dates(event)
    db_event = Event(**event)
    db_event.save()

def manage_chairs(dict):
    if dict.has_key('chairs'):
        chairs=[]
        chairsDict = dict.pop('chairs')
        for chair in chairsDict:
            chair['eventId'] = dict['id']
            a_chair = Chair(**chair)
            a_chair.save()
            chairs.append(a_chair)
        dict['chairs']=chairs
    else:
        dict['chairs']=[]

def manage_presenters(dict):
    if dict.has_key('presenters'):
        presenters=[]
        presentersDict = dict.pop('presenters')
        for presenter in presentersDict:
            a_presenter = Presenter(**presenter)
            a_presenter.save()
            presenters.append(a_presenter)
        dict['presenters']=presenters
    else:
        dict['presenters']=[]

def manage_material(dict):
    if dict.has_key('material'):
        materials=[]
        materialDict = dict.pop('material')
        for material in materialDict:
            manage_resource(material)
            a_material = Material(**material)
            a_material.save()
            materials.append(a_material)
        dict['material']=materials
    else:
        dict['material']=[]

def manage_resource(dict):
    if dict.has_key('resources'):
        resources = []
        for resource in dict['resources']:
            a_resource = Resource(**resource)
            a_resource.save()
            resources.append(a_resource)
        dict['resources']=resources
    else:
        dict['resources']=[]

def convert_dates(dict):
    start_date = dict.pop('startDate')
    converted_start_date = convert_date(start_date)
    dict['startDate'] = converted_start_date
    end_date = dict.pop('endDate')
    converted_end_date = convert_date(end_date)
    dict['endDate'] = converted_end_date


def convert_date(date):
    string_date = date['date']+"T"+date['time']
    new_date = datetime.now()
    return new_date.strptime(string_date, '%Y-%m-%dT%H:%M:%S')

@getEvent.route('/eventInfo', methods=['GET'])
def eventInfo():
    event_id = request.args.get('eventID')
    isEventInDB = query_session.query(Event).filter(Event.id==event_id)
    if isEventInDB.count()>0:
        event = isEventInDB[0]
        chairs = []
        for chair in event._field_values['chairs']:
            chair._field_values.pop('mongo_id')
            chairs.append(chair._field_values)
        event._field_values['chairs'] = chairs
        start_date = event._field_values.pop('startDate')
        event._field_values['startDate'] = {'date':start_date.strftime('%Y-%m-%d') , 'time':start_date.strftime('%H:%M:%S')}
        end_date = event._field_values.pop('endDate')
        event._field_values['endDate'] = {'date':end_date.strftime('%Y-%m-%d') , 'time':end_date.strftime('%H:%M:%S')}
        event._field_values.pop('mongo_id')
        return json.dumps(event._field_values)
    else:
        req = urllib2.Request('http://'+current_app.config['SERVER_URL']+'/indico/export/event/'+event_id+'.json?ak='+current_app.config['API_KEY'])
        opener = urllib2.build_opener()
        f = opener.open(req)
        return json.dumps(simplejson.load(f)['results'])

#@getEvent.route('/searchEvent', methods=['GET'])
#def searchEvent():
#    search = request.args.get('search')
#    if mongo.db.events.find({'title': {'$regex':search, '$options':'i'}},{'_id':0,'id':1,'title':1,'date':1}).count()>0:
#        return json.dumps(list(mongo.db.events.find({'title': {'$regex':search, '$options':'i'}},{'_id':0,'id':1,'title':1,'date':1})))
#    else:
#        return json.dumps('')

@getEvent.route('/searchEvent', methods=['GET'])
def searchEvent():
    search = request.args.get('search')
    if query_session.db.Event.find({'title': {'$regex':search, '$options':'i'}},{'_id':0,'id':1,'title':1,'startDate':1}).count()>0:
        events = query_session.db.Event.find({'title': {'$regex':search, '$options':'i'}},{'_id':0,'id':1,'title':1,'startDate':1})
        results = []
        for event in events:
            start_date = event.pop('startDate')
            event['startDate'] = {'date':start_date.strftime('%Y-%m-%d') , 'time':start_date.strftime('%H:%M:%S')}
            results.append(event)
        return json.dumps(results)
    else:
        return json.dumps({})

@getEvent.route('/futureEvents', methods=['GET'])
def getFutureEvents():
    part = request.args.get('part')
    req = urllib2.Request('http://'+current_app.config['SERVER_URL']+'/indico/export/categ/0.json?ak='+current_app.config['API_KEY']+'&from=today&pretty=yes&limit=10&offset='+part)
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.dumps(simplejson.load(f))

@getEvent.route('/pastEvents', methods=['GET'])
def getPastEvent():
    part = request.args.get('part')
    req = urllib2.Request('http://'+current_app.config['SERVER_URL']+'/indico/export/categ/0.json?ak='+current_app.config['API_KEY']+'&from=-30d&to=today&pretty=yes&limit=10&offset='+part)
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.dumps(simplejson.load(f))

@getEvent.route('/futureEvent2', methods=['GET'])
def getFutureEvent2():
    part = request.args.get('part')
    req = urllib2.Request('http://'+current_app.config['SERVER_URL']+'/indico/export/categ/0.json?ak='+current_app.config['API_KEY']+'&from=today&pretty=yes&limit='+part)
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.dumps(simplejson.load(f))

@getEvent.route('/pastEvent2', methods=['GET'])
def getPastEvent2():
    part = request.args.get('part')
    req = urllib2.Request('http://'+current_app.config['SERVER_URL']+'/indico/export/categ/0.json?ak='+current_app.config['API_KEY']+'&from=-30d&to=today&pretty=yes&limit='+part)
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.dumps(simplejson.load(f))