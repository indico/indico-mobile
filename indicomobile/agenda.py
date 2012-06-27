from flask import Blueprint, json, current_app
from indicomobile.db.base import ref
from indicomobile.db.schema import *
from indicomobile.events import *
from datetime import datetime, timedelta, date

agenda = Blueprint('agenda', __name__, template_folder='templates')


@events.route('/agenda/events/user/<user_id>/', methods=['GET'])
def myAgendaEvents(user_id):
    events = []
    contributions = db.AgendaContribution.find({'user_id': user_id}).distinct('contribution.conferenceId')
    for event_id in contributions:
        event = db.Event.find_one({'id': event_id})
        if not event in events:
            events.append(event)
    sessions = db.AgendaSessionSlot.find({'user_id': user_id}).distinct('session_slot.conferenceId')
    for event_id in sessions:
        event = db.Event.find_one({'id': event_id})
        if not event in events:
            events.append(event)
    events_in_db = db.AgendaEvent.find({'user_id': user_id})
    for event in events_in_db:
        events.append(event['event'])
    events = sorted(events, key=lambda x:x['startDate'])
    events.reverse()
    return json.dumps(events)


@agenda.route('/addEvent/<event_id>/user/<user_id>/', methods=['GET'])
def addEvent(event_id, user_id):
    with_event(event_id=event_id)
    event = db.Event.find_one({'id': event_id})
    if db.AgendaEvent.find_one({'user_id': user_id, 'event.id': event_id}):
        print 'already in agenda'
    else:
        db.agenda_contributions.remove({'user_id': user_id, 'contribution.conferenceId': event_id})
        db.agenda_session_slots.remove({'user_id': user_id, 'session_slot.conferenceId': event_id})
        agenda_event = db.AgendaEvent()
        agenda_event.update({'user_id': user_id, 'event': event})
        agenda_event.save()
    return ''


@agenda.route('/addSession/<event_id>/session/<session_id>/user/<user_id>/', methods=['GET'])
def addSession(event_id, session_id, user_id):
    agenda_sessions = db.agenda_session_slots.find({'user_id': user_id,'session_slot.conferenceId': event_id})
    event_sessions = db.SessionSlot.find({'conferenceId': event_id}).distinct('sessionId')
    session = db.SessionSlot.find_one({'conferenceId': event_id, 'sessionId': session_id})
    if len(event_sessions)-agenda_sessions.count() == 1:
        addEvent(event_id, user_id)
    elif db.AgendaSessionSlot.find_one({'user_id': user_id, 'session_slot.sessionId': session_id}):
        print 'already in agenda'
    else:
        contributions = db.AgendaContribution.find({'user_id': user_id, 'contribution.conferenceId': event_id})
        for contribution in contributions:
            current_contribution = contribution['contribution']
            if db.dereference(current_contribution['slot'])['sessionId'] == session_id:
                db.agenda_contributions.remove({'user_id': user_id,
                                            'contribution.conferenceId': event_id,
                                            'contribution.contributionId': current_contribution['contributionId']})
        agenda_session = db.AgendaSessionSlot()
        agenda_session.update({'user_id': user_id, 'session_slot': session})
        agenda_session.save()
    return ''


@agenda.route('/addContribution/<event_id>/contribution/<contribution_id>/user/<user_id>/', methods=['GET'])
def addContribution(event_id, contribution_id, user_id):
    if db.AgendaContribution.find_one({'user_id': user_id, 'contribution.contributionId': contribution_id}):
        print 'already in agenda'
    else:
        agenda_contribution = db.Contribution.find_one({'contributionId': contribution_id, 'conferenceId': event_id})
        if agenda_contribution['slot']:
            session_id = db.dereference(agenda_contribution['slot'])['sessionId']
            agenda_contributions = db.AgendaContribution.find({'user_id': user_id, 'contribution.conferenceId': event_id})
            num_contrib_in_session_agenda = 0
            num_contrib_in_session_db = 0
            for contribution in agenda_contributions:
                current_contribution = contribution['contribution']
                if current_contribution['slot']:
                    if db.dereference(current_contribution['slot'])['sessionId'] == session_id:
                        num_contrib_in_session_agenda += 1
            sessions_in_db = db.SessionSlot.find({'conferenceId': event_id, 'sessionId': session_id})
            for session in sessions_in_db:
                num_contrib_in_session_db += len(session['entries'])
            if num_contrib_in_session_db - num_contrib_in_session_agenda == 1:
                addSession(event_id, session_id, user_id)
            else:
                new_contribution = db.AgendaContribution()
                new_contribution.update({'user_id': user_id, 'contribution': agenda_contribution})
                new_contribution.save()
        else:
            num_contrib_in_event = db.Contribution.find({'conferenceId': event_id, 'contributionId': {'$ne': None}}).count()
            num_contrib_in_agenda = db.AgendaContribution.find({'contribution.conferenceId': event_id, 'user_id': user_id}).count()
            if num_contrib_in_event - num_contrib_in_agenda == 1:
                addEvent(event_id, user_id)
            else:
                new_contribution = db.AgendaContribution()
                new_contribution.update({'user_id': user_id, 'contribution': agenda_contribution})
                new_contribution.save()
    return ''

@agenda.route('/removeEvent/<event_id>/user/<user_id>/', methods=['GET'])
def removeEvent(event_id, user_id):
    db.agenda_events.remove({'user_id': user_id, 'event.id': event_id})
    db.agenda_contributions.remove({'user_id': user_id, 'contribution.conferenceId': event_id})
    db.agenda_session_slots.remove({'user_id': user_id, 'session_slot.conferenceId': event_id})
    return ''


@agenda.route('/removeSession/<event_id>/session/<session_id>/user/<user_id>/', methods=['GET'])
def removeSession(event_id, session_id, user_id):
    eventInAgenda = db.AgendaEvent.find_one({'user_id': user_id, 'event.id': event_id})
    sessionInAgenda = db.AgendaSessionSlot.find_one({'user_id': user_id, 'session_slot.conferenceId': event_id, 'session_slot.sessionId': session_id})
    if eventInAgenda:
        print 'remove session from event'
        db.agenda_events.remove({'user_id': user_id, 'event.id': event_id})
        session_ids = db.SessionSlot.find({'conferenceId': event_id}).distinct('sessionId')
        for current_id in session_ids:
            if current_id != session_id:
                session_slot = db.SessionSlot.find_one({'conferenceId': event_id, 'sessionId': current_id})
                if session_slot:
                    agenda_session = db.AgendaSessionSlot()
                    agenda_session.update({'user_id': user_id, 'session_slot': session_slot})
                    agenda_session.save()
    elif sessionInAgenda:
        print 'remove session'
        db.agenda_session_slots.remove({'user_id': user_id, 'session_slot.sessionId': session_id})
    else:
        print 'remove contributions'
        contributions = db.AgendaContribution.find({'user_id': user_id, 'contribution.conferenceId': event_id})
        for contribution in contributions:
            print contribution
            current_contribution = contribution['contribution']
            if current_contribution['slot']:
                current_slot = db.dereference(current_contribution['slot'])
                if current_slot['sessionId'] == session_id:
                    removeContribution(event_id, current_contribution['contributionId'], user_id)
    return ''


@agenda.route('/removeContribution/<event_id>/contribution/<contribution_id>/user/<user_id>/', methods=['GET'])
def removeContribution(event_id, contribution_id, user_id):
    agenda_contribution = db.AgendaContribution.find_one({'user_id': user_id, 'contribution.contributionId': contribution_id, 'contribution.conferenceId': event_id})
    contribution_db = db.Contribution.find_one({'conferenceId': event_id, 'contributionId': contribution_id})
    if contribution_db['slot']:
        session_id = db.dereference(contribution_db['slot'])['sessionId']
    if agenda_contribution:
        db.agenda_contributions.remove({'user_id': user_id, 'contribution.contributionId': contribution_id})
    elif db.AgendaEvent.find_one({'user_id': user_id, 'event.id': event_id}):
        db.agenda_events.remove({'user_id': user_id, 'event.id': event_id})
        contributions = db.Contribution.find({'conferenceId': event_id, 'contributionId': {'$ne': contribution_id}})
        for contribution in contributions:
            addContribution(event_id, contribution['contributionId'], user_id)
    elif db.AgendaSessionSlot.find_one({'user_id': user_id, 'session_slot.sessionId': session_id}):
        contributions = db.Contribution.find({'conferenceId': event_id, 'slot':{'$ne': None}, 'contributionId': {'$ne': contribution_id}})
        db.agenda_session_slots.remove({'user_id': user_id, 'session_slot.sessionId': session_id})
        for contribution in contributions:
            if db.dereference(contribution['slot'])['sessionId'] == session_id:
                addContribution(event_id, contribution['contributionId'], user_id)
    return ''


def createListAgendaContributions(contributions, user_id):
    contribs_in_db = []
    for contribution in contributions:
        session = contribution['slot']
        if db.AgendaEvent.find_one({'user_id': user_id, 'event.id': contribution['conferenceId']}):
            contribs_in_db.append(contribution)
        if session:
            if db.AgendaSessionSlot.find_one({'user_id': user_id,
                                            'session_slot.sessionId': session['sessionId'],
                                            'session_slot.conferenceId': contribution['conferenceId']}):
                contribs_in_db.append(contribution)
        if db.AgendaContribution.find_one({'user_id': user_id,
                                            'contribution.contributionId': contribution['contributionId'],
                                            'contribution.conferenceId': contribution['conferenceId']}):
            contribs_in_db.append(contribution)
    return json.dumps(contribs_in_db)


def createListAgendaEvents(events, user_id):
    events_in_db = []
    for event in events:
        if db.AgendaEvent.find_one({'user_id': user_id, 'event.id': event['id']}):
            events_in_db.append(event)
    return json.dumps(events_in_db)


@agenda.route('/agenda/event/<event_id>/allsessions/user/<user_id>/', methods=['GET'])
def getAgendaAllSessions(event_id, user_id):
    event_in_db = db.AgendaEvent.find_one({'user_id': user_id, 'event.id': event_id})
    sessions_in_db = db.AgendaSessionSlot.find({'user_id': user_id,
                                                'session_slot.conferenceId': event_id})
    contributions_in_db = db.AgendaContribution.find({'user_id': user_id,
                                                    'contribution.conferenceId': event_id})
    sessions = []
    if event_in_db:
        return eventSessions(event_id)
    else:
        for session in sessions_in_db:
            sessions.append(session['session_slot'])
        contributions_in_db = db.AgendaContribution.find({'user_id': user_id,
                                                        'contribution.conferenceId': event_id})
        for contribution in contributions_in_db:
            current_contribution = contribution['contribution']
            if current_contribution['slot']:
                session = db.dereference(current_contribution['slot'])
                if not session in sessions:
                    sessions.append(session)
        return json.dumps(sorted(sessions, key=lambda x:x['title']))


@agenda.route('/agenda/event/<event_id>/days/user/<user_id>/', methods=['GET'])
def getAgendaDays(event_id, user_id):
    if db.AgendaEvent.find_one({'user_id': user_id, 'event.id': event_id}):
        return eventDays(event_id)
    else:
        days = []
        agenda_sessions = db.AgendaSessionSlot.find({'user_id': user_id, 'session_slot.conferenceId': event_id})
        sessions = []
        for session in agenda_sessions:
            current_session = session['session_slot']
            for slot in db.SessionSlot.find({'conferenceId': event_id, 'sessionId': current_session['sessionId']}):
                sessions.append(slot)
        contributions = db.AgendaContribution.find({'user_id': user_id, 'contribution.conferenceId': event_id})
        for contribution in contributions:
            current_contribution = contribution['contribution']
            date = current_contribution['startDate'].strftime('%Y-%m-%d')
            if not date in days:
                days.append(date)
        for session in sessions:
            date = session['startDate'].strftime('%Y-%m-%d')
            if not date in days:
                days.append(date)
        results = []
        for day in days:
            new_day = db.Day()
            new_day.update({'date': day, 'conferenceId': event_id, 'entries': []})
            results.append(new_day)
        return json.dumps(sorted(results, key=lambda x:x['date']))


@agenda.route('/agenda/event/<event_id>/speakers/user/<user_id>/', methods=['GET'])
def getAgendaSpeakers(event_id, user_id):
    if db.AgendaEvent.find_one({'user_id': user_id, 'event.id': event_id}):
        return eventSpeakers(event_id)
    else:
        speakers = []
        agenda_sessions = db.AgendaSessionSlot.find({'user_id': user_id, 'session_slot.conferenceId': event_id})
        contribs = []
        for session in agenda_sessions:
            current_session = session['session_slot']
            for slot in db.SessionSlot.find({'conferenceId': event_id, 'sessionId': current_session['sessionId']}):
                for contrib in slot['entries']:
                    contribs.append(db.dereference(contrib))
        contributions = db.AgendaContribution.find({'user_id': user_id, 'contribution.conferenceId': event_id})
        for contribution in contributions:
            current_contribution = contribution['contribution']
            for speaker in current_contribution['presenters']:
                if not speaker in speakers:
                    speakers.append(speaker)
        for contribution in contribs:
            for speaker in contribution['presenters']:
                if not speaker in speakers:
                    speakers.append(speaker)

        return json.dumps(sorted(speakers, key=lambda x:x['name']))


@agenda.route('/agenda/event/<event_id>/session/<session_id>/entries/user/<user_id>/', methods=['GET'])
def getAgendaDaysSession(event_id, session_id, user_id):
    event_in_db = db.AgendaEvent.find_one({'user_id': user_id, 'event.id': event_id})
    session_in_db = db.AgendaSessionSlot.find_one({'user_id': user_id, 'session_slot.sessionId': session_id,
                                                'session_slot.conferenceId': event_id})
    if event_in_db:
        return eventSameSessions(event_id, session_id)
    elif session_in_db:
        return eventSameSessions(event_id, session_id)
    else:
        sessions = []
        contributions_in_db = db.AgendaContribution.find({'user_id': user_id,
                                                        'contribution.conferenceId': event_id})
        for contribution in contributions_in_db:
            current_contribution = contribution['contribution']
            session = db.dereference(current_contribution['slot'])
            if not session in sessions and session['sessionId'] == session_id:
                sessions.append(session)
        return json.dumps(sorted(sessions, key=lambda x:x['startDate']))


@agenda.route('/agenda/event/<event_id>/day/<day>/contributions/user/<user_id>/', methods=['GET'])
def getAgendaDayContributions(event_id, day, user_id):
    contributions = json.loads(dayContributions(event_id, day))
    return createListAgendaContributions(contributions, user_id)


@agenda.route('/agenda/event/<event_id>/sessions/user/<user_id>/', methods=['GET'])
def getAgendaSessions(event_id, user_id):
    sessions = json.loads(eventSessions(event_id))
    sessions_in_db = []
    for session in sessions:
        if db.AgendaEvent.find_one({'user_id': user_id, 'event.id': session['conferenceId']}):
                sessions_in_db.append(session)
        elif db.AgendaSessionSlot.find_one({'user_id': user_id,
                                            'session_slot.sessionId': session['sessionId'],
                                            'session_slot.conferenceId': session['conferenceId']}):
                sessions_in_db.append(session)
    return json.dumps(sessions_in_db)


@agenda.route('/agenda/event/<event_id>/session/<session_id>/day/<day>/contribs/user/<user_id>/', methods=['GET'])
def getAgendaSessionContributions(event_id, session_id, day, user_id):
    contributions = json.loads(sessionDayContributions(event_id, session_id, day))
    return createListAgendaContributions(contributions, user_id)


@agenda.route('/agenda/event/<event_id>/speaker/<speaker_id>/contributions/user/<user_id>/', methods=['GET'])
def getAgendaSpeakerContributions(event_id, speaker_id, user_id):
    contributions = json.loads(speakerContributions(event_id, speaker_id))
    return createListAgendaContributions(contributions, user_id)


@agenda.route('/agenda/searchEvent/<search>/user/<user_id>/', methods=['GET'])
def getAgendaSearchEvent(search, user_id):
    events = json.loads(search_event(search, everything=True))
    return createListAgendaEvents(events, user_id)


@agenda.route('/agenda/ongoingEvents/user/<user_id>/', methods=['GET'])
def getAgendaOngoingEvents(user_id):
    events = json.loads(getOngoingEvents())
    return createListAgendaEvents(events, user_id)


@agenda.route('/agenda/futureEvents/user/<user_id>/', methods=['GET'])
def getAgendaFutureEvents(user_id):
    events = json.loads(getFutureEvents())
    return createListAgendaEvents(events, user_id)


@agenda.route('/agenda/ongoingSimpleEvents/user/<user_id>/', methods=['GET'])
def getAgendaOngoingSimpleEvents(user_id):
    json_result = getOngoingSimpleEvents()
    if json_result:
        events = json.loads(json_result)
        return createListAgendaEvents(events, user_id)
    else:
        return json.dumps([])


@agenda.route('/agenda/ongoingContributions/user/<user_id>/', methods=['GET'])
def getAgendaOngoingContributions(user_id):
    contributions = json.loads(getOngoingContributions())
    return createListAgendaContributions(contributions, user_id)


@agenda.route('/agenda/history/user/<user_id>/', methods=['GET'])
def getAgendaHistory(user_id):
    events = []
    event_ids = json.loads(request.args.get('events'))
    for event in event_ids:
        eventInAgenda = db.AgendaEvent.find_one({'user_id': user_id, 'event.id': event})
        if eventInAgenda:
            events.append(eventInAgenda['event'])
    return json.dumps(events)


@agenda.route('/agenda/nextEvent/user/<user_id>/', methods=['GET'])
def getNextEvent(user_id):
    events = []
    now = datetime.utcnow()
    agenda_events = db.AgendaEvent.find({'user_id': user_id})
    agenda_sessions = db.AgendaSessionSlot.find({'user_id': user_id})
    agenda_contributions = db.AgendaContribution.find({'user_id': user_id})
    for event in agenda_events:
        current_event = event['event']
        if current_event['type'] == 'simple_event':
            events.append(current_event)
        else:
            contributions = db.Contribution.find({'conferenceId': current_event['id'],
                                                'startDate': {'$gte': now}}).sort('startDate',-1)
            if contributions.count() > 0:
                events.append(contributions[0])
    for session in agenda_sessions:
        current_session = session['session_slot']
        session_slots = db.SessionSlot.find({'conferenceId': current_session['conferenceId'],
                                            'sessionId': current_session['sessionId']})
        for session_slot in session_slots:
            contributions = []
            for contribution in session_slot['entries']:
                if db.dereference(contribution)['startDate'] > now:
                    contributions.append(db.dereference(contribution))
            if len(contributions) > 0:
                events.append(sorted(contributions, key=lambda x:x['startDate'])[0])
    for contribution in agenda_contributions:
        current_contribution = contribution['contribution']
        contributions = []
        if current_contribution['startDate'] > now:
            contributions.append(current_contribution)
        if len(contributions) > 0:
            events.append(sorted(contributions, key=lambda x:x['startDate'])[0])
    nextEvent = []
    if len(events) > 0:
        nextEvent = sorted(events, key=lambda x:x['startDate'])[0]
    return json.dumps(nextEvent)