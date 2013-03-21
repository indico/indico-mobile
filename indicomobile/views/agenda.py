from datetime import datetime, date
from flask import Blueprint, json, request,  session as flask_session
import indicomobile.db.event as db_event
import indicomobile.db.contribution as db_contribution
import indicomobile.db.session as db_session
import indicomobile.core.agenda as my_agenda
import indicomobile.core.event as event_logic


agenda = Blueprint('agenda', __name__, template_folder='templates')

@agenda.before_request
def check_user(event_id=None):
    if 'indico_user' not in flask_session:
        return json.dumps([])

@agenda.route('/agenda/events/', methods=['GET'])
def my_agenda_events():
    user_id = flask_session['indico_user']
    events = []
    contributions = db_contribution.get_agenda_contributions(user_id, distinct=True)
    for event_id in contributions:
        event = db_event.get_event(event_id)
        if not event in events:
            events.append(event)
    sessions = db_session.get_agenda_sessions(user_id, distinct=True)
    for event_id in sessions:
        event = db_event.get_event(event_id)
        if not event in events:
            events.append(event)
    events_in_db = db_event.get_agenda_events(user_id)
    for event in events_in_db:
        events.append(event['event'])
    events = sorted(events, key=lambda x:x['startDate'])
    events.reverse()
    return json.dumps(events)


@agenda.route('/addEvent/<event_id>/', methods=['GET'])
def add_event(event_id):
    user_id = flask_session['indico_user']
    event_logic.update_event_info(event_id)
    event = db_event.get_event(event_id)
    if db_event.get_agenda_event(user_id, event_id):
        print 'already in agenda'
    else:
        db_contribution.remove_event_contributions_from_agenda(user_id, event_id)
        db_session.remove_event_sessions_from_agenda(user_id, event_id)
        db_event.add_event_to_agenda(user_id, event)
    return ''


@agenda.route('/addSession/<event_id>/session/<session_id>/', methods=['GET'])
def add_session(event_id, session_id):
    user_id = flask_session['indico_user']
    agenda_sessions = db_session.get_agenda_event_sessions(user_id, event_id)
    event_sessions = db_session.get_event_sessions(event_id)
    session = db_session.get_event_session(event_id, session_id)
    if len(event_sessions)-agenda_sessions.count() == 1:
        add_event(event_id)
    elif db_session.get_agenda_session(user_id, event_id, session_id):
        print 'already in agenda'
    else:
        contributions = db_contribution.get_agenda_event_contributions(user_id, event_id, True)
        for contribution in contributions:
            current_contribution = contribution['contribution']
            if current_contribution['slot']:
                if current_contribution['slot']['sessionId'] == session_id:
                    db_contribution.remove_contribution_from_agenda(user_id, event_id, current_contribution['contributionId'])
        db_session.add_session_to_agenda(user_id, session)
    return ''


@agenda.route('/addContribution/<event_id>/contribution/<contribution_id>/', methods=['GET'])
def add_contribution(event_id, contribution_id):
    user_id = flask_session['indico_user']
    if contribution_id:
        if db_contribution.get_agenda_contribution(user_id, event_id, contribution_id):
            print 'already in agenda'
        else:
            agenda_contribution = db_contribution.get_contribution(event_id, contribution_id)
            if agenda_contribution['slot']:
                session_id = agenda_contribution['slot']['sessionId']
                agenda_contributions = db_contribution.get_agenda_event_contributions(user_id, event_id, True)
                num_contrib_in_session_agenda = 0
                num_contrib_in_session_db = 0
                for contribution in agenda_contributions:
                    current_contribution = contribution['contribution']
                    if current_contribution['slot']:
                        if current_contribution['slot']['sessionId'] == session_id:
                            num_contrib_in_session_agenda += 1
                sessions_in_db = db_session.get_event_session(event_id, session_id)
                for session in sessions_in_db:
                    num_contrib_in_session_db += len(session['entries'])
                if num_contrib_in_session_db - num_contrib_in_session_agenda == 1:
                    add_session(event_id, session_id)
                else:
                    db_contribution.add_contribution_to_agenda(user_id, agenda_contribution)
            else:
                num_contrib_in_event = len(db_contribution.get_event_contributions(event_id, {'contributionId': {'$ne': None}}, False, False))
                num_contrib_in_agenda = db_contribution.get_num_agenda_event_contributions(user_id, event_id)
                if num_contrib_in_event - num_contrib_in_agenda == 1:
                    add_event(event_id)
                else:
                    db_contribution.add_contribution_to_agenda(user_id, agenda_contribution)
    return ''

@agenda.route('/removeEvent/<event_id>/', methods=['GET'])
def remove_event(event_id):
    user_id = flask_session['indico_user']
    db_event.remove_full_event_from_agenda(user_id, event_id)
    return ''


@agenda.route('/removeSession/<event_id>/session/<session_id>/', methods=['GET'])
def remove_session(event_id, session_id):
    user_id = flask_session['indico_user']
    eventInAgenda = db_event.get_agenda_event(user_id, event_id)
    sessionInAgenda = db_session.get_agenda_session(user_id, event_id, session_id)
    if eventInAgenda:
        db_event.remove_event_from_agenda(user_id, event_id)
        session_ids = db_session.get_event_sessions(event_id)
        for current_id in session_ids:
            if current_id != session_id:
                session_slot = db_session.get_event_session(event_id, current_id)
                if session_slot:
                    db_session.add_session_to_agenda(user_id, session_slot)
    elif sessionInAgenda:
        db_session.remove_session_from_agenda(user_id, event_id, session_id)
    else:
        contributions = db_contribution.get_agenda_event_contributions(user_id, event_id, True)
        for contribution in contributions:
            current_contribution = contribution['contribution']
            if current_contribution['slot']:
                current_slot = current_contribution['slot']
                if current_slot['sessionId'] == session_id:
                    remove_contribution(event_id, current_contribution['contributionId'])
    return ''


@agenda.route('/removeContribution/<event_id>/contribution/<contribution_id>/', methods=['GET'])
def remove_contribution(event_id, contribution_id):
    user_id = flask_session['indico_user']
    agenda_contribution = db_contribution.get_agenda_contribution(user_id, event_id, contribution_id)
    contribution_db = db_contribution.get_contribution(event_id, contribution_id)
    session_id = None
    if contribution_db['slot']:
        session_id = contribution_db['slot']['sessionId']
    if agenda_contribution:
        db_contribution.remove_contribution_from_agenda(user_id, event_id, contribution_id)
    elif db_event.get_agenda_event(user_id, event_id):
        db_event.remove_event_from_agenda(user_id, event_id)
        contributions = db_contribution.get_event_contributions(event_id, {'contributionId': {'$ne': contribution_id}})
        for contribution in contributions:
            add_contribution(event_id, contribution['contributionId'])
    elif session_id:
        if  db_contribution.get_agenda_contribution(user_id, event_id, session_id):
            contributions = db_contribution.get_event_contributions(event_id, {'slot':{'$ne': None}, 'contributionId': {'$ne': contribution_id}}, True)
            db_session.remove_session_from_agenda(user_id, event_id, session_id)
            for contribution in contributions:
                if contribution['slot']['sessionId'] == session_id:
                    add_contribution(event_id, contribution['contributionId'])
    return ''

@agenda.route('/agenda/event/<event_id>/allsessions/', methods=['GET'])
def get_agenda_event_all_sessions(event_id):
    user_id = flask_session['indico_user']
    event_in_db = db_event.get_agenda_event(user_id, event_id)
    sessions = []
    if event_in_db:
        return json.dumps(event_logic.get_event_sessions(event_id))
    else:
        sessions_in_db = db_session.get_agenda_event_sessions(user_id, event_id)
        for session in sessions_in_db:
            sessions.append(session['session_slot'])
        contributions_in_db = db_contribution.get_agenda_event_contributions(user_id, event_id)
        for contribution in contributions_in_db:
            current_contribution = contribution['contribution']
            if current_contribution['slot']:
                session = current_contribution['slot']
                if not session in sessions:
                    sessions.append(session)
        return json.dumps(sorted(sessions, key=lambda x:x['title']))


@agenda.route('/agenda/event/<event_id>/days/', methods=['GET'])
def get_agenda_event_days(event_id):
    user_id = flask_session['indico_user']
    if db_event.get_agenda_event(user_id, event_id):
        return json.dumps(db_event.get_event_days(event_id))
    else:
        days = []
        agenda_sessions = db_session.get_agenda_event_sessions(user_id, event_id)
        sessions = []
        for session in agenda_sessions:
            current_session = session['session_slot']
            for slot in db_session.get_event_session_slots(event_id, current_session['sessionId'], False):
                sessions.append(slot)
        contributions = db_contribution.get_agenda_event_contributions(user_id, event_id)
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
            results.append(db_event.create_event_day(event_id, day))
        return json.dumps(sorted(results, key=lambda x:x['date']))


@agenda.route('/agenda/event/<event_id>/speakers/', methods=['GET'])
def get_agenda_event_speakers(event_id):
    user_id = flask_session['indico_user']
    if db_event.get_agenda_event(user_id, event_id):
        return json.dumps(event_logic.get_event_speakers(event_id, int(request.args.get('page', 1))))
    else:
        speakers = []
        agenda_sessions = db_session.get_agenda_event_sessions(user_id, event_id)
        contribs = []
        for session in agenda_sessions:
            current_session = session['session_slot']
            for slot in db_session.get_event_session_slots(event_id, current_session['sessionId'], True):
                for contrib in slot['entries']:
                    contribs.append(contrib)
        contributions = db_contribution.get_agenda_event_contributions(user_id, event_id)
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


@agenda.route('/agenda/event/<event_id>/session/<session_id>/entries/', methods=['GET'])
def get_agenda_event_days_session(event_id, session_id):
    user_id = flask_session['indico_user']
    event_in_db = db_event.get_agenda_event(user_id, event_id)
    session_in_db = db_session.get_agenda_session(user_id, event_id, session_id)
    if event_in_db:
        return json.dumps(event_logic.get_event_same_sessions(event_id, session_id))
    elif session_in_db:
        return json.dumps(event_logic.get_event_same_sessions(event_id, session_id))
    else:
        sessions = []
        contributions_in_db = db_contribution.get_agenda_event_contributions(user_id, event_id, True)
        for contribution in contributions_in_db:
            current_contribution = contribution['contribution']
            if current_contribution['slot']:
                session = current_contribution['slot']
                if not session in sessions and session['sessionId'] == session_id:
                    sessions.append(session)
        return json.dumps(sorted(sessions, key=lambda x:x['startDate']))


@agenda.route('/agenda/event/<event_id>/day/<day>/contributions/', methods=['GET'])
def get_agenda_event_day_Contributions(event_id, day):
    user_id = flask_session['indico_user']
    contributions = event_logic.get_event_day_contributions(event_id, day)
    return json.dumps(my_agenda.get_agenda_contributions(contributions, user_id))


@agenda.route('/agenda/event/<event_id>/sessions/', methods=['GET'])
def get_agenda_event_sessions(event_id):
    user_id = flask_session['indico_user']
    sessions = event_logic.get_event_sessions(event_id)
    sessions_in_db = []
    for session in sessions:
        if db_event.get_agenda_event(user_id, session['conferenceId']):
            sessions_in_db.append(session)
        elif db_session.get_agenda_session(user_id, session['conferenceId'], session['sessionId']):
            sessions_in_db.append(session)
    return json.dumps(sessions_in_db)


@agenda.route('/agenda/event/<event_id>/session/<session_id>/day/<day>/contribs/', methods=['GET'])
def get_agenda_session_contributions(event_id, session_id, day):
    user_id = flask_session['indico_user']
    contributions = event_logic.get_session_day_contributions(event_id, session_id, day)
    return json.dumps(my_agenda.get_agenda_contributions(contributions, user_id))


@agenda.route('/agenda/event/<event_id>/speaker/<speaker_id>/contributions/', methods=['GET'])
def get_agenda_event_speaker_contributions(event_id, speaker_id):
    user_id = flask_session['indico_user']
    contributions = event_logic.get_speaker_contributions(event_id, speaker_id)
    return json.dumps(my_agenda.get_agenda_contributions(contributions, user_id))


@agenda.route('/agenda/searchEvent/<search>/', methods=['GET'])
def search_agenda_event(search):
    user_id = flask_session['indico_user']
    events = event_logic.search_event(search, True, int(request.args.get('page', 1)))
    return json.dumps(my_agenda.get_agenda_events(events, user_id))


@agenda.route('/agenda/searchContrib/event/<event_id>/day/<day>/search/<search>/', methods=['GET'])
def search_agenda_contribution(event_id, day, search):
    user_id = flask_session['indico_user']
    contributions = event_logic.generic_search_contrib(search, event_id, day, None)
    return json.dumps(my_agenda.get_agenda_contributions(contributions, user_id))


@agenda.route('/agenda/searchContrib/event/<event_id>/session/<session_id>/day/<day>/search/<search>/', methods=['GET'])
def search_agenda_contrib_in_session(event_id, session_id, day, search):
    user_id = flask_session['indico_user']
    contributions = event_logic.generic_search_contrib(search, event_id, day, session_id)
    return json.dumps(my_agenda.get_agenda_contributions(contributions, user_id))

@agenda.route('/agenda/ongoingEvents/', methods=['GET'])
def get_agenda_ongoing_events():
    user_id = flask_session['indico_user']
    events = event_logic.get_ongoing_events()
    return json.dumps(my_agenda.get_agenda_events(events, user_id))


@agenda.route('/agenda/futureEvents/', methods=['GET'])
def get_agenda_future_events():
    user_id = flask_session['indico_user']
    events = event_logic.get_future_events()
    return json.dumps(my_agenda.get_agenda_events(events, user_id))


@agenda.route('/agenda/ongoingContributions/', methods=['GET'])
def get_agenda_ongoing_contributions():
    user_id = flask_session['indico_user']
    contributions = event_logic.get_ongoing_contributions()
    return json.dumps(my_agenda.get_agenda_contributions(contributions, user_id))


@agenda.route('/agenda/historyEvents/', methods=['GET'])
def get_agenda_history():
    user_id = flask_session['indico_user']
    events = []
    event_ids = db_event.get_history(user_id, order=-1)
    for event in event_ids:
        eventInHistory = db_event.get_agenda_event(user_id, event['id'])
        if eventInHistory:
            events.append(eventInHistory['event'])
    return json.dumps(events)


@agenda.route('/agenda/nextEvent/', methods=['GET'])
def get_agenda_next_event():
    user_id = flask_session['indico_user']
    events = []
    now = datetime.utcnow()
    agenda_events = db_event.get_agenda_events(user_id)
    agenda_sessions = db_session.get_agenda_sessions(user_id)
    agenda_contributions = db_contribution.get_agenda_contributions(user_id)
    for event in agenda_events:
        current_event = event['event']
        if current_event['type'] == 'simple_event':
            if current_event['startDate'] > now:
                events.append(current_event)
        else:
            contributions = db_contribution.get_event_contributions(current_event['id'], {'startDate': {'$gte': now}}, False, True)
            if contributions:
                events.append(contributions[0])
    for session in agenda_sessions:
        current_session = session['session_slot']
        session_slots = db_session.get_event_session_slots(current_session['conferenceId'], current_session['sessionId'], True)
        for session_slot in session_slots:
            contributions = []
            for contribution in session_slot['entries']:
                if contribution['startDate'] > now:
                    contributions.append(contribution)
            if len(contributions) > 0:
                events.append(sorted(contributions, key=lambda x:x['startDate'])[0])
    contributions = []
    for contribution in agenda_contributions:
        current_contribution = contribution['contribution']
        if current_contribution['startDate'] > now:
            contributions.append(current_contribution)
    if len(contributions) > 0:
        contributions = sorted(contributions, key=lambda x:x['startDate'])
        events.append(contributions[0])
    nextEvent = []
    if len(events) > 0:
        nextEvent = sorted(events, key=lambda x:x['startDate'])[0]
    return json.dumps(nextEvent)