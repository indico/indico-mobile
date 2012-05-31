import urllib2
import urllib
import time

from datetime import datetime, timedelta
from pytz import timezone
from flask import request, json, current_app
from indicomobile.db.schema import *
from mongoalchemy.fields import DateTimeField
from mongoalchemy.session import Session as MongoSession

events = Blueprint('events', __name__, template_folder='templates')
query_session = MongoSession.connect('library')

""" allow datetime to be serialized to JSON """
dthandler = lambda obj: {'date': obj.replace(tzinfo=timezone("UTC")).astimezone(timezone(current_app.config['TZ'])).strftime('%Y-%m-%d'),
                         'time': obj.replace(tzinfo=timezone("UTC")).astimezone(timezone(current_app.config['TZ'])).strftime('%H:%M:%S'),
                         'tz': obj.replace(tzinfo=timezone("UTC")).astimezone(timezone(current_app.config['TZ'])).strftime('%Z')} if isinstance(obj, datetime) else None


@events.route('/event/<event_id>/days', methods=['GET'])
def eventDays(event_id):
    is_event_up_to_date(event_id)
    days = []
    for day in query_session.query(Day).filter(Day.eventId == event_id):
        days.append(day.fields())
    return json.dumps(days)


@events.route('/event/<event_id>/day/<day_date>', methods=['GET'])
def eventDay(event_id, day_date):
    day = query_session.query(Day).filter(Day.eventId == event_id,
                                          Day.date == day_date)[0]
    return json.dumps(day.fields())


@events.route('/event/<event_id>/session/<session_id>', methods=['GET'])
def eventSession(event_id, session_id):
    session = query_session.query(Session).filter(Session.eventId == event_id,
                                                  Session.id == session_id)[0]
    return json.dumps(session.fields(), default=dthandler)


@events.route('/event/<event_id>/sessions/<session_id>', methods=['GET'])
def eventSameSessions(event_id, session_id):
    sessionsDB = query_session.query(Session).filter(Session.eventId == event_id,
                                                     Session.sessionId == session_id)
    sessions = []
    for session in sessionsDB:
        sessions.append(session.fields())
    return json.dumps(sessions, default=dthandler)


@events.route('/event/<event_id>/contrib/<contrib_id>', methods=['GET'])
def eventContribution(event_id, contrib_id):
    is_event_up_to_date(event_id)
    contrib_query = query_session.query(Contribution)
    contribution = contrib_query.filter(Contribution.eventId == event_id,
                                        Contribution.contributionId == contrib_id)[0]
    return json.dumps(contribution.fields(), default=dthandler)


@events.route('/event/<event_id>/day/<day_date>/contributions', methods=['GET'])
def dayContributions(event_id, day_date):
    contributions = []
    first_query = query_session.query(Contribution).filter(Contribution.eventId == event_id,
                                                      Contribution.dayDate == day_date)
    contribs_DB = first_query
    for contrib in contribs_DB:
        contributions.append(contrib.fields())
    return json.dumps(contributions, default=dthandler)


@events.route('/event/<event_id>/sessions', methods=['GET'])
def eventSessions(event_id):
    sessions = []
    is_event_up_to_date(event_id)
    first_query = query_session.query(Session).filter(Session.eventId == event_id)
    sessions_DB = first_query
    for session in sessions_DB:
        sessions.append(session.fields())
    return json.dumps(sessions, default=dthandler)


@events.route('/event/<event_id>/session/<session_id>/contribs', methods=['GET'])
def sessionContributions(event_id, session_id):
    contributions = []
    contrib_query = query_session.query(Contribution)
    first_query = contrib_query.filter(Contribution.eventId == event_id,
                                       Contribution.sessionId == session_id)
    contributions_DB = first_query
    for contribution in contributions_DB:
        contributions.append(contribution.fields())
    return json.dumps(contributions, default=dthandler)


@events.route('/event/<event_id>/contribs', methods=['GET'])
def eventContributions(event_id):
    contributions = []
    contrib_query = query_session.query(Contribution)
    contributions_DB = contrib_query.filter(Contribution.eventId == event_id)
    for contribution in contributions_DB:
        contributions.append(contribution.fields())
    return json.dumps(contributions, default=dthandler)


@events.route('/event/<event_id>/speaker/<speaker_id>/contributions', methods=['GET'])
def speakerContributions(event_id, speaker_id):
    contributions = []
    speaker_query = query_session.query(Presenter)
    speaker = speaker_query.filter(Presenter.eventId == event_id,
                                   Presenter.id == speaker_id)[0]
    for contrib in speaker.contributionId:
        contrib_query = query_session.query(Contribution)
        contrib_DB = contrib_query.filter(Contribution.eventId == event_id,
                                       Contribution.contributionId == contrib)[0]
        contributions.append(contrib_DB.fields())
    return json.dumps(contributions, default=dthandler)


@events.route('/event/<event_id>/speakers', methods=['GET'])
def eventSpeakers(event_id):
    speakers = []
    is_event_up_to_date(event_id)
    speaker_query = query_session.query(Presenter)
    speakers_DB = speaker_query.filter(Presenter.eventId == event_id)
    for speaker in speakers_DB:
        speakers.append(speaker.fields())
    return json.dumps(speakers, default=dthandler)


@events.route('/event/<event_id>/speaker/<speaker_id>', methods=['GET'])
def eventSpeaker(event_id, speaker_id):
    speaker_query = query_session.query(Presenter)
    speaker = speaker_query.filter(Presenter.eventId == event_id,
                                   Presenter.id == speaker_id)[0]
    return json.dumps(speaker.fields(), default=dthandler)


def getEventInfo(event_id):
    event_req = urllib2.Request(current_app.config['SERVER_URL'] +
                                '/export/event/' + event_id +
                                '.json?ak=' + current_app.config['API_KEY'] + '&nocache=yes')
    event_opener = urllib2.build_opener()
    f1 = event_opener.open(event_req)
    event_info = json.load(f1)
    return event_info['results'][0]


def addEventToDB(event_id):
    timetable_req = urllib2.Request(current_app.config['SERVER_URL'] +
                                    '/export/timetable/' + event_id +
                                    '.json?ak=' +
                                    current_app.config['API_KEY'])
    timetable_opener = urllib2.build_opener()
    f2 = timetable_opener.open(timetable_req)
    event_tt = json.load(f2)
    current_event = getEventInfo(event_id)
    manage_event(current_event, event_tt, event_id)


def manage_event(event, event_tt, event_id):
    number_contributions = 0
    number_sessions = 0
    for day in event_tt['results'][event_id]:
        current_day = event_tt['results'][event_id][day]
        if current_day:
            contributions_in_day = 0
            day_date = ''
            for session in current_day:
                if day_date == '':
                        day_date = current_day[session]['startDate']['date']
                if 'contributionId' in current_day[session]:
                    manage_contributions(current_day[session], '',
                                             '', '',
                                             event_id, day_date, False,
                                             '#000000')
                    contributions_in_day += 1
                    number_contributions += 1
                else:
                    contributions = 0
                    current_session = current_day[session]
                    current_session['eventId'] = event['id']
                    if 'entries' in current_session:
                        for contribution in current_session['entries']:
                            if 'contributionId' in current_session['entries'][contribution]:
                                manage_contributions(current_session['entries'][contribution], current_session['sessionId'],
                                                     current_session['id'], current_session['title'],
                                                     current_session['eventId'], day_date, current_session['isPoster'],
                                                     current_session['color'])
                                contributions_in_day += 1
                                contributions += 1
                                number_contributions += 1
                        current_session.pop('entries')
                    if contributions > 0:
                        current_session['numContributions'] = contributions
                        current_session['dayDate'] = day_date
                        convert_dates(current_session)
                        manage_material(current_session, event_id)
                        manage_presenters(current_session, current_session['eventId'], current_session['id'])
                        current_session['conveners'] = ''
                        db_session = Session(**current_session)
                        db_session.save()
                        number_sessions = number_sessions + 1
            if contributions_in_day > 0:
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


def is_event_up_to_date(event_id):
    is_event_in_DB = query_session.query(Event).filter(Event.id == event_id)
    event = getEventInfo(event_id)
    if is_event_in_DB.count() > 0:
        mongo_modif_date = is_event_in_DB[0].modificationDate
        indico_modif_date = convert_date(event['modificationDate']).replace(tzinfo=None)
        if mongo_modif_date < indico_modif_date:
            is_event_in_DB[0].remove()
            query_session.remove_query(Contribution).filter(Contribution.eventId == event_id).execute()
            query_session.remove_query(Session).filter(Session.eventId == event_id).execute()
            query_session.remove_query(Day).filter(Day.eventId == event_id).execute()
            query_session.remove_query(Presenter).filter(Presenter.eventId == event_id).execute()
            query_session.remove_query(Chair).filter(Chair.eventId == event_id).execute()
            query_session.remove_query(Material).filter(Material.eventId == event_id).execute()
            query_session.remove_query(Resource).filter(Resource.eventId == event_id).execute()
    else:
        addEventToDB(event_id)


def session_contribs_number(event_id):
    sessions = query_session.query(Session).filter({'eventId': event_id})
    for session in sessions:
        contribs = query_session.query(Contribution).filter({'sessionId': session.sessionId,
                                                             'eventId': event_id}).count()
        query_session.query(Session).filter({'eventId': event_id, 'sessionId': session.sessionId}).set(Session.numContributions, contribs).multi().execute()

def manage_contributions(contribution, session_id, session_unique_id, session_title, event_id, day_date, is_poster, color):
    convert_dates(contribution)
    manage_material(contribution, event_id)
    manage_presenters(contribution, event_id, contribution['contributionId'])
    contribution['sessionId'] = session_id
    contribution['sessionUniqueId'] = session_unique_id
    contribution['sessionTitle'] = session_title
    contribution['eventId'] = event_id
    contribution['dayDate'] = day_date
    contribution['isPoster'] = is_poster
    contribution['color'] = color
    contribution.pop('id')
    db_contribution = Contribution(**contribution)
    db_contribution.save()


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


def manage_presenters(dictionary, event_id, contribution_id):
    if 'presenters' in dictionary:
        presenters = []
        presenters_dict = dictionary.pop('presenters')
        for presenter in presenters_dict:
            is_presenter_in_DB = query_session.query(Presenter).filter(Presenter.eventId == event_id,
                                                                       Presenter.email == presenter['email'],
                                                                       Presenter.name == presenter['name'])
            if (is_presenter_in_DB.count() > 0):
                is_presenter_in_DB.append(Presenter.contributionId, contribution_id).execute()
                presenters.append(is_presenter_in_DB[0])
            else:
                presenter['id'] = presenter['name'].replace(')','').replace('(','').replace(', ','').replace(' ','') + presenter['email']
                presenter['eventId'] = event_id
                presenter['contributionId'] = [contribution_id]
                a_presenter = Presenter(**presenter)
                a_presenter.save()
                presenters.append(a_presenter)
        dictionary['presenters'] = presenters
    else:
        dictionary['presenters'] = []


def manage_material(dictionary, event_id):
    if 'material' in dictionary:
        materials = []
        material_dict = dictionary.pop('material')
        for material in material_dict:
            manage_resource(material, event_id)
            material['eventId'] = event_id
            a_material = Material(**material)
            a_material.save()
            materials.append(a_material)
        dictionary['material'] = materials
    else:
        dictionary['material'] = []


def manage_resource(dictionary, event_id):
    if 'resources' in dictionary:
        resources = []
        for resource in dictionary['resources']:
            resource['eventId'] = event_id
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
    if 'modificationDate' in dictionary:
        modif_date = dictionary.pop('modificationDate')
        converted_modif_date = convert_date(modif_date)
        dictionary['modificationDate'] = converted_modif_date


def convert_date(date):
    d = datetime.combine(datetime.strptime(date['date'], "%Y-%m-%d"),
                         datetime.strptime(date['time'].split('.')[0], "%H:%M:%S").time())
    d=timezone(date['tz']).localize(d)
    return d


@events.route('/event/<event_id>', methods=['GET'])
def eventInfo(event_id):
    is_event_up_to_date(event_id)
    is_event_in_DB = query_session.query(Event).filter(Event.id == event_id)
    if is_event_in_DB.count() > 0:
        event = is_event_in_DB[0]
        return json.dumps(event.fields(), default=dthandler)
    else:
        return json.dumps(getEventInfo(event_id))


@events.route('/searchEvent', methods=['GET'])
def search_event():
    search = urllib.quote(request.args.get('search'))
    url = current_app.config['SERVER_URL'] + \
          '/export/event/search/' + search + \
          '.json?ak=' + \
          current_app.config['API_KEY']
    req = urllib2.Request(url)
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.dumps(json.load(f)['results'])


@events.route('/searchSpeaker/<event_id>', methods=['GET'])
def search_speaker(event_id):
    search = urllib.quote(request.args.get('search'))
    words = search.split('%20')
    regex = ''
    for word in words:
        regex += '(?=.*' + word + ')'
    speakers = query_session.db.Presenter.find({'name': {'$regex': regex, '$options': 'i'},
                                                    'eventId': event_id})
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
    words = search.split('%20')
    regex = ''
    for word in words:
        regex += '(?=.*' + word + ')'
    contributions = query_session.db.Contribution.find({'title': {'$regex': regex, '$options': 'i'},
                                           'eventId': event_id,
                                           'dayDate': day_date})
    if contributions.count() > 0:
        results = []
        for contrib in contributions:
            contrib.pop('_id')
            contrib['presenters'] = []
            contrib['material'] = []
            contrib = Contribution(**contrib)
            results.append(contrib.fields())
        return json.dumps(results, default=dthandler)
    else:
        return json.dumps({})


@events.route('/searchContrib/event/<event_id>/session/<session_id>/day/<day_date>', methods=['GET'])
def search_contrib_in_session(event_id, session_id, day_date):
    search = urllib.quote(request.args.get('search'))
    words = search.split('%20')
    regex = ''
    for word in words:
        regex += '(?=.*' + word + ')'
    contributions = query_session.db.Contribution.find({'title': {'$regex': regex, '$options': 'i'},
                                           'eventId': event_id,
                                           'dayDate': day_date,
                                           'sessionId': session_id})
    if contributions.count() > 0:
        results = []
        for contrib in contributions:
            contrib.pop('_id')
            contrib['presenters'] = []
            contrib['material'] = []
            contrib = Contribution(**contrib)
            results.append(contrib.fields())
        return json.dumps(results, default=dthandler)
    else:
        return json.dumps({})


@events.route('/futureEvents/<part>', methods=['GET'])
def getFutureEvents(part):
    today = datetime.today()
    event_in_DB = query_session.query(Recent_Event).filter(Recent_Event.today < DateTimeField().wrap(today - timedelta(days=1)))
    if event_in_DB.count() > 0:
        print 'cache too old'
        query_session.db.Recent_Event.drop()

    event_in_DB = query_session.query(Recent_Event).filter(Recent_Event.part == part)
    if (event_in_DB.count() > 0):
        results = []
        for event in event_in_DB:
            results.append(event.fields())
        return json.dumps(results, default=dthandler)
    else:
            req = urllib2.Request(current_app.config['SERVER_URL'] +
                                  '/export/categ/0.json?ak=' +
                                  current_app.config['API_KEY'] +
                                  '&from=1d&pretty=yes&offset=' + part + '&limit=15')
            opener = urllib2.build_opener()
            f = opener.open(req)
            events = json.load(f)['results']
            for event in events:
                convert_dates(event)
                new_event = Recent_Event(today=today, title=event['title'],
                                         id=event['id'], startDate=event['startDate'],
                                         part=part, endDate=event['endDate'])
                new_event.save()
            return json.dumps(events, default=dthandler)


@events.route('/ongoingEvents/<part>', methods=['GET'])
def getOngoingEvents(part):
    today = datetime.today()
    event_in_DB = query_session.query(Ongoing_Event).filter(Ongoing_Event.today < DateTimeField().wrap(today - timedelta(days=1)))
    if event_in_DB.count() > 0:
        print 'cache too old'
        query_session.db.Ongoing_Event.drop()
    event_in_DB = query_session.query(Ongoing_Event).filter(Ongoing_Event.part == part)
    if (event_in_DB.count() > 0):
        results = []
        for event in event_in_DB:
            results.append(event.fields())
        return json.dumps(results, default=dthandler)
    else:
            req = urllib2.Request(current_app.config['SERVER_URL'] +
                                  '/export/categ/0.json?ak=' +
                                  current_app.config['API_KEY'] +
                                  '&from=today&to=today&pretty=yes&offset=' + part + '&limit=15')
            opener = urllib2.build_opener()
            f = opener.open(req)
            events = json.load(f)['results']
            for event in events:
                convert_dates(event)
                new_event = Ongoing_Event(today=today, title=event['title'],
                                         id=event['id'], startDate=event['startDate'],
                                         part=part, endDate=event['endDate'])
                new_event.save()
            return json.dumps(events, default=dthandler)


@events.route('/ongoingContributions/', methods=['GET'])
def getOngoingContributions():
    now = datetime.now()
    event_in_DB = query_session.query(Ongoing_Contribution).filter(Ongoing_Contribution.now < DateTimeField().wrap(now - timedelta(hours=1)))
    if event_in_DB.count() > 0:
        print 'cache too old'
        query_session.db.Ongoing_Contribution.drop()
    event_in_DB = query_session.query(Ongoing_Contribution)
    if (event_in_DB.count() > 0):
        results = []
        for event in event_in_DB:
            results.append(event.fields())
        return json.dumps(results, default=dthandler)
    else:
        return saveOngoingContributions()


def saveOngoingContributions():
    now = datetime.now()
    req = urllib2.Request(current_app.config['SERVER_URL'] +
                          '/export/categ/0.json?ak=' +
                          current_app.config['API_KEY'] +
                          '&from=today&to=today&detail=contributions&pretty=yes')
    opener = urllib2.build_opener()
    f = opener.open(req)
    events = json.load(f)['results']
    contribs = []
    for event in events:
        if event['type'] == 'simple_event':
            if 'startDate' in event:
                    if event['startDate'] != None:
                        if event['startDate']['date'] == now.strftime('%Y-%m-%d'):
                            if now < datetime.strptime(event['startDate']['date']+'_'+event['startDate']['time'], '%Y-%m-%d_%H:%M:%S'):
                                convert_dates(event)
                                event['speakers'] = []
                                event['material'] = []
                                event['eventId'] = event['id']
                                event['contributionId'] = event.pop('id')
                                event['now'] = now
                                event.pop('chairs')
                                event.pop('modificationDate')
                                new_contrib = Ongoing_Contribution(**event)
                                new_contrib.save()
                                contribs.append(event)
        else:
            for contrib in event['contributions']:
                if 'startDate' in contrib:
                    if contrib['startDate'] != None:
                        if contrib['startDate']['date'] == now.strftime('%Y-%m-%d'):
                            if now < datetime.strptime(contrib['startDate']['date']+'_'+contrib['startDate']['time'], '%Y-%m-%d_%H:%M:%S'):
                                convert_dates(contrib)
                                contrib['speakers'] = []
                                contrib['material'] = []
                                contrib['eventId'] = event['id']
                                contrib['contributionId'] = contrib.pop('id')
                                contrib['now'] = now
                                new_contrib = Ongoing_Contribution(**contrib)
                                new_contrib.save()
                                contribs.append(contrib)
    return json.dumps(contribs, default=dthandler)


