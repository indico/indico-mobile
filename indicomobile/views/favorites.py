from datetime import datetime, date
from flask import Blueprint, json, request, Response, session as flask_session
import indicomobile.db.event as db_event
import indicomobile.db.contribution as db_contribution
import indicomobile.db.session as db_session
import indicomobile.core.favorites as my_favorites
import indicomobile.core.event as event_logic


favorites = Blueprint('favorites', __name__, template_folder='templates')

@favorites.before_request
def check_user(event_id=None):
    if 'indico_user' not in flask_session:
        return Response(json.dumps([]), mimetype='application/json')

@favorites.route('/services/favorites/events/', methods=['GET'])
def my_favorites_events():
    user_id = flask_session['indico_user']
    events = []
    contributions = db_contribution.get_favorites_contributions(user_id, distinct=True)
    for event_id in contributions:
        event = db_event.get_event(event_id)
        if not event in events:
            events.append(event)
    sessions = db_session.get_favorites_sessions(user_id, distinct=True)
    for event_id in sessions:
        event = db_event.get_event(event_id)
        if not event in events:
            events.append(event)
    events_in_db = db_event.get_favorites_events(user_id)
    for event in events_in_db:
        events.append(event['event'])
    events = sorted(events, key=lambda x:x['startDate'])
    events.reverse()
    return Response(json.dumps(events), mimetype='application/json')


@favorites.route('/services/favorites/addEvent/<event_id>/', methods=['POST'])
def add_event(event_id):
    user_id = flask_session['indico_user']
    event_logic.update_event_info(event_id)
    event = db_event.get_event(event_id)
    if db_event.get_favorites_event(user_id, event_id):
        print 'already in favorites'
    else:
        db_contribution.remove_event_contributions_from_favorites(user_id, event_id)
        db_session.remove_event_sessions_from_favorites(user_id, event_id)
        db_event.add_event_to_favorites(user_id, event)
    return ''

@favorites.route('/services/favorites/addSession/<event_id>/session/<session_id>/', methods=['POST'])
def add_session(event_id, session_id):
    user_id = flask_session['indico_user']
    favorites_sessions = db_session.get_favorites_event_sessions(user_id, event_id)
    event_sessions = db_session.get_event_sessions(event_id)
    session = db_session.get_event_session(event_id, session_id)
    if len(event_sessions)-favorites_sessions.count() == 1:
        add_event(event_id)
    elif db_session.get_favorites_session(user_id, event_id, session_id):
        print 'already in favorites'
    else:
        contributions = db_contribution.get_favorites_event_contributions(user_id, event_id, True)
        for contribution in contributions:
            current_contribution = contribution['contribution']
            if current_contribution['slot']:
                if current_contribution['slot']['sessionId'] == session_id:
                    db_contribution.remove_contribution_from_favorites(user_id, event_id, current_contribution['contributionId'])
        db_session.add_session_to_favorites(user_id, session)
    return ''

@favorites.route('/services/favorites/addContribution/<event_id>/contribution/<contribution_id>/', methods=['POST'])
def add_contribution(event_id, contribution_id):
    user_id = flask_session['indico_user']
    if contribution_id:
        if db_contribution.get_favorites_contribution(user_id, event_id, contribution_id):
            print 'already in favorites'
        else:
            favorites_contribution = db_contribution.get_contribution(event_id, contribution_id)
            if favorites_contribution['slot']:
                session_id = favorites_contribution['slot']['sessionId']
                favorites_contributions = db_contribution.get_favorites_event_contributions(user_id, event_id, True)
                num_contrib_in_session_favorites = 0
                num_contrib_in_session_db = 0
                for contribution in favorites_contributions:
                    current_contribution = contribution['contribution']
                    if current_contribution['slot']:
                        if current_contribution['slot']['sessionId'] == session_id:
                            num_contrib_in_session_favorites += 1
                sessions_in_db = db_session.get_event_same_sessions(event_id, session_id)
                for session in sessions_in_db:
                    num_contrib_in_session_db += len(session['entries'])
                if num_contrib_in_session_db - num_contrib_in_session_favorites == 1:
                    add_session(event_id, session_id)
                else:
                    db_contribution.add_contribution_to_favorites(user_id, favorites_contribution)
            else:
                num_contrib_in_event = len(db_contribution.get_event_contributions(event_id, {'contributionId': {'$ne': None}}, False, False))
                num_contrib_in_favorites = db_contribution.get_num_favorites_event_contributions(user_id, event_id)
                if num_contrib_in_event - num_contrib_in_favorites == 1:
                    add_event(event_id)
                else:
                    db_contribution.add_contribution_to_favorites(user_id, favorites_contribution)
    return ''

@favorites.route('/services/favorites/removeEvent/<event_id>/', methods=['POST'])
def remove_event(event_id):
    user_id = flask_session['indico_user']
    db_event.remove_full_event_from_favorites(user_id, event_id)
    return ''


@favorites.route('/services/favorites/removeSession/<event_id>/session/<session_id>/', methods=['POST'])
def remove_session(event_id, session_id):
    user_id = flask_session['indico_user']
    eventInFavorites = db_event.get_favorites_event(user_id, event_id)
    sessionInFavorites = db_session.get_favorites_session(user_id, event_id, session_id)
    if eventInFavorites:
        db_event.remove_event_from_favorites(user_id, event_id)
        session_ids = db_session.get_event_sessions(event_id)
        for current_id in session_ids:
            if current_id != session_id:
                session_slot = db_session.get_event_session(event_id, current_id)
                if session_slot:
                    db_session.add_session_to_favorites(user_id, session_slot)
    elif sessionInFavorites:
        db_session.remove_session_from_favorites(user_id, event_id, session_id)
    else:
        contributions = db_contribution.get_favorites_event_contributions(user_id, event_id, True)
        for contribution in contributions:
            current_contribution = contribution['contribution']
            if current_contribution['slot']:
                current_slot = current_contribution['slot']
                if current_slot['sessionId'] == session_id:
                    remove_contribution(event_id, current_contribution['contributionId'])
    return ''


@favorites.route('/services/favorites/removeContribution/<event_id>/contribution/<contribution_id>/', methods=['POST'])
def remove_contribution(event_id, contribution_id):
    user_id = flask_session['indico_user']
    favorites_contribution = db_contribution.get_favorites_contribution(user_id, event_id, contribution_id)
    contribution_db = db_contribution.get_contribution(event_id, contribution_id)
    session_id = None
    if contribution_db['slot']:
        session_id = contribution_db['slot']['sessionId']
    if favorites_contribution:
        db_contribution.remove_contribution_from_favorites(user_id, event_id, contribution_id)
    elif db_event.get_favorites_event(user_id, event_id):
        db_event.remove_event_from_favorites(user_id, event_id)
        contributions = db_contribution.get_event_contributions(event_id, {'contributionId': {'$ne': contribution_id}})
        for contribution in contributions:
            add_contribution(event_id, contribution['contributionId'])
    elif session_id:
        if  db_contribution.get_favorites_contribution(user_id, event_id, session_id):
            contributions = db_contribution.get_event_contributions(event_id, {'slot':{'$ne': None}, 'contributionId': {'$ne': contribution_id}}, True)
            db_session.remove_session_from_favorites(user_id, event_id, session_id)
            for contribution in contributions:
                if contribution['slot']['sessionId'] == session_id:
                    add_contribution(event_id, contribution['contributionId'])
    return ''


@favorites.route('/services/favorites/event/<event_id>/allsessions/', methods=['GET'])
def get_favorites_event_all_sessions(event_id):
    user_id = flask_session['indico_user']
    event_in_db = db_event.get_favorites_event(user_id, event_id)
    sessions = []
    if event_in_db:
        return Response(json.dumps(event_logic.get_event_sessions(event_id)), mimetype='application/json')
    else:
        sessions_in_db = db_session.get_favorites_event_sessions(user_id, event_id)
        for session in sessions_in_db:
            sessions.append(session['session_slot'])
        contributions_in_db = db_contribution.get_favorites_event_contributions(user_id, event_id)
        for contribution in contributions_in_db:
            current_contribution = contribution['contribution']
            if current_contribution['slot']:
                session = current_contribution['slot']
                if not session in sessions:
                    sessions.append(session)
        return Response(json.dumps(sorted(sessions, key=lambda x:x['title'])), mimetype='application/json')


@favorites.route('/services/favorites/event/<event_id>/days/', methods=['GET'])
def get_favorites_event_days(event_id):
    user_id = flask_session['indico_user']
    if db_event.get_favorites_event(user_id, event_id):
        return Response(json.dumps(list(db_event.get_event_days(event_id))), mimetype='application/json')
    else:
        days = []
        favorites_sessions = db_session.get_favorites_event_sessions(user_id, event_id)
        sessions = []
        for session in favorites_sessions:
            current_session = session['session_slot']
            for slot in db_session.get_event_session_slots(event_id, current_session['sessionId'], False):
                sessions.append(slot)
        contributions = db_contribution.get_favorites_event_contributions(user_id, event_id)
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
        return Response(json.dumps(sorted(results, key=lambda x:x['date'])), mimetype='application/json')


@favorites.route('/services/favorites/event/<event_id>/speakers/', methods=['GET'])
def get_favorites_event_speakers(event_id):
    user_id = flask_session['indico_user']
    if db_event.get_favorites_event(user_id, event_id):
        return Response(json.dumps(event_logic.get_event_speakers(event_id, int(request.args.get('page', 1)))), mimetype='application/json')
    else:
        speakers = []
        favorites_sessions = db_session.get_favorites_event_sessions(user_id, event_id)
        contribs = []
        for session in favorites_sessions:
            current_session = session['session_slot']
            for slot in db_session.get_event_session_slots(event_id, current_session['sessionId'], True):
                for contrib in slot['entries']:
                    contribs.append(contrib)
        contributions = db_contribution.get_favorites_event_contributions(user_id, event_id)
        for contribution in contributions:
            current_contribution = contribution['contribution']
            for speaker in current_contribution['presenters']:
                if not speaker in speakers:
                    speakers.append(speaker)
        for contribution in contribs:
            for speaker in contribution['presenters']:
                if not speaker in speakers:
                    speakers.append(speaker)

        return Response(json.dumps(sorted(speakers, key=lambda x:x['name'])), mimetype='application/json')


@favorites.route('/services/favorites/event/<event_id>/session/<session_id>/entries/', methods=['GET'])
def get_favorites_event_days_session(event_id, session_id):
    user_id = flask_session['indico_user']
    event_in_db = db_event.get_favorites_event(user_id, event_id)
    session_in_db = db_session.get_favorites_session(user_id, event_id, session_id)
    if event_in_db:
        return Response(json.dumps(event_logic.get_event_same_sessions(event_id, session_id)), mimetype='application/json')
    elif session_in_db:
        return Response(json.dumps(event_logic.get_event_same_sessions(event_id, session_id)), mimetype='application/json')
    else:
        sessions = []
        contributions_in_db = db_contribution.get_favorites_event_contributions(user_id, event_id, True)
        for contribution in contributions_in_db:
            current_contribution = contribution['contribution']
            if current_contribution['slot']:
                session = current_contribution['slot']
                if not session in sessions and session['sessionId'] == session_id:
                    sessions.append(session)
        return Response(json.dumps(sorted(sessions, key=lambda x:x['startDate'])), mimetype='application/json')


@favorites.route('/services/favorites/event/<event_id>/day/<day>/contributions/', methods=['GET'])
def get_favorites_event_day_contributions(event_id, day):
    user_id = flask_session['indico_user']
    contributions = event_logic.get_event_day_contributions(event_id, day)
    return Response(json.dumps(my_favorites.get_favorites_contributions(contributions, user_id)), mimetype='application/json')


@favorites.route('/services/favorites/event/<event_id>/sessions/', methods=['GET'])
def get_favorites_event_sessions(event_id):
    user_id = flask_session['indico_user']
    sessions = event_logic.get_event_sessions(event_id)
    sessions_in_db = []
    for session in sessions:
        if db_event.get_favorites_event(user_id, session['conferenceId']):
            sessions_in_db.append(session)
        elif db_session.get_favorites_session(user_id, session['conferenceId'], session['sessionId']):
            sessions_in_db.append(session)
    return Response(json.dumps(sessions_in_db), mimetype='application/json')


@favorites.route('/services/favorites/event/<event_id>/session/<session_id>/day/<day>/contribs/', methods=['GET'])
def get_favorites_session_contributions(event_id, session_id, day):
    user_id = flask_session['indico_user']
    contributions = event_logic.get_session_day_contributions(event_id, session_id, day)
    return Response(json.dumps(my_favorites.get_favorites_contributions(contributions, user_id)), mimetype='application/json')


@favorites.route('/services/favorites/event/<event_id>/speaker/<speaker_id>/contributions/', methods=['GET'])
def get_favorites_event_speaker_contributions(event_id, speaker_id):
    user_id = flask_session['indico_user']
    contributions = event_logic.get_speaker_contributions(event_id, speaker_id)
    return Response(json.dumps(my_favorites.get_favorites_contributions(contributions, user_id)), mimetype='application/json')


@favorites.route('/services/favorites/searchEvent/<search>/', methods=['GET'])
def search_favorites_event(search):
    user_id = flask_session['indico_user']
    events = event_logic.search_event(search, True, int(request.args.get('page', 1)))
    return Response(json.dumps(my_favorites.get_favorites_events(events, user_id)), mimetype='application/json')


@favorites.route('/services/favorites/ongoingEvents/', methods=['GET'])
def get_favorites_ongoing_events():
    user_id = flask_session['indico_user']
    events = event_logic.get_ongoing_events(int(request.args.get('page', 1)))
    return Response(json.dumps(my_favorites.get_favorites_events(events, user_id)), mimetype='application/json')


@favorites.route('/services/favorites/futureEvents/', methods=['GET'])
def get_favorites_future_events():
    user_id = flask_session['indico_user']
    events = event_logic.get_future_events(int(request.args.get('page', 1)))
    return Response(json.dumps(my_favorites.get_favorites_events(events, user_id)), mimetype='application/json')


@favorites.route('/services/favorites/ongoingContributions/', methods=['GET'])
def get_favorites_ongoing_contributions():
    user_id = flask_session['indico_user']
    contributions = event_logic.get_ongoing_contributions()
    return Response(json.dumps(my_favorites.get_favorites_contributions(contributions, user_id)), mimetype='application/json')


@favorites.route('/services/favorites/historyEvents/', methods=['GET'])
def get_favorites_history():
    user_id = flask_session['indico_user']
    events = []
    event_ids = db_event.get_history(user_id, order=-1)
    for event in event_ids:
        eventInHistory = db_event.get_favorites_event(user_id, event['id'])
        if eventInHistory:
            events.append(eventInHistory['event'])
    return Response(json.dumps(events), mimetype='application/json')


@favorites.route('/services/favorites/nextEvent/', methods=['GET'])
def get_favorites_next_event():
    user_id = flask_session['indico_user']
    events = []
    now = datetime.utcnow()
    favorites_events = db_event.get_favorites_events(user_id)
    favorites_sessions = db_session.get_favorites_sessions(user_id)
    favorites_contributions = db_contribution.get_favorites_contributions(user_id)
    for event in favorites_events:
        current_event = event['event']
        if current_event['type'] == 'simple_event':
            if current_event['startDate'] > now:
                events.append(current_event)
        else:
            contributions = db_contribution.get_event_contributions(current_event['id'], {'startDate': {'$gte': now}}, False, True)
            if contributions:
                events.append(contributions[0])
    for session in favorites_sessions:
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
    for contribution in favorites_contributions:
        current_contribution = contribution['contribution']
        if current_contribution['startDate'] > now:
            contributions.append(current_contribution)
    if len(contributions) > 0:
        contributions = sorted(contributions, key=lambda x:x['startDate'])
        events.append(contributions[0])
    nextEvent = []
    if len(events) > 0:
        nextEvent = sorted(events, key=lambda x:x['startDate'])[0]
    return Response(json.dumps(nextEvent), mimetype='application/json')