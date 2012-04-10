import urllib2, simplejson
from datetime import datetime, tzinfo,time
from time import strptime
from flask import Flask, Blueprint, render_template, request, json, current_app
from dbClasses import *
from flask.ext.pymongo import PyMongo
from mongoalchemy.session import Session as MongoSession

getEvent = Blueprint('getEvent', __name__, template_folder='templates')
mongo = PyMongo(app)
query_session = MongoSession.connect('library')

@getEvent.route('/eventTT', methods=['GET'])
def timetable():
    event_id = request.args.get('eventID')
    event_title = request.args.get('eventTitle')
    event_date = request.args.get('eventDate')
    part = request.args.get('part')
    isEventInDB = query_session.query(Event).filter(Event.id==event_id)
    if isEventInDB.count()==0:
        addEventToDB(event_id)
    if mongo.db.events.find({'id':event_id}).count() == 0:
        req = urllib2.Request('http://'+current_app.config['SERVER_URL']+'/indico/export/timetable/'+event_id+'.json?ak='+current_app.config['API_KEY'])
        opener = urllib2.build_opener()
        f = opener.open(req)
        event_tt = simplejson.load(f)
        mongo.db.events.save({'id':event_id, 'title':event_title, 'date':event_date})
        mongo.db.events.update({'id':event_id},{'$set': {'days' : event_tt['results'][event_id]}})
        mongo.db.events.update({'id':event_id},{'$set': {'added' : time()}})
        return json.dumps(mongo.db.events.find({'id':event_id},{'_id':0})[0])
    else:
        if mongo.db.events.find({'id':event_id})[0].get('added')==None:
            mongo.db.events.update({'id':event_id},{'$set': {'added' : time()}})
        return json.dumps(mongo.db.events.find({'id':event_id},{'_id':0})[0])

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
    days = []
    for day in event_tt['results'][event_id]:
        current_day=event_tt['results'][event_id][day]
        if current_day:
            day_date=''
            sessions=[]
            for session in current_day:
                current_session = current_day[session]
                contributions=[]
                if current_session.has_key('entries'):
                    for contribution in current_session['entries']:
                        current_contribution = current_session['entries'][contribution]
                        convert_dates(current_contribution)
                        manage_material(current_contribution)
                        manage_presenters(current_contribution)
                        db_contribution = Contribution(**current_contribution)
                        db_contribution.save()
                        contributions.append(db_contribution)
                    current_session.pop('entries')
                    current_session['contributions']=contributions
                else:
                    current_session['contributions']=contributions
                if day_date == '':
                    day_date = current_session['startDate']['date']
                convert_dates(current_session)
                manage_material(current_session)
                manage_presenters(current_session)
                current_session['conveners']=''
                db_session = Session(**current_session)
                db_session.save()
                sessions.append(db_session)
            db_day = Day(date=day_date, sessions=sessions)
            db_day.save()
            days.append(db_day)
    event['days'] = days
    manage_chairs(event)
    convert_dates(event)
    db_event = Event(**event)
    db_event.save()

def manage_chairs(dict):
    if dict.has_key('chairs'):
        chairs=[]
        chairsDict = dict.pop('chairs')
        for chair in chairsDict:
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
    eventID = request.args.get('eventID')
    req = urllib2.Request('http://'+current_app.config['SERVER_URL']+'/indico/export/event/'+eventID+'.json?ak='+current_app.config['API_KEY'])
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.dumps(simplejson.load(f))

@getEvent.route('/eventInDB', methods=['GET'])
def getEventInDB():
    if mongo.db.events.find().count()>0:
        return json.dumps(list(mongo.db.events.find({},{'_id':0,'id':1,'title':1, 'date':1})))
    else:
        return json.dumps('')

@getEvent.route('/searchEvent', methods=['GET'])
def searchEvent():
    search = request.args.get('search')
    if mongo.db.events.find({'title': {'$regex':search, '$options':'i'}},{'_id':0,'id':1,'title':1,'date':1}).count()>0:
        return json.dumps(list(mongo.db.events.find({'title': {'$regex':search, '$options':'i'}},{'_id':0,'id':1,'title':1,'date':1})))
    else:
        return json.dumps('')

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