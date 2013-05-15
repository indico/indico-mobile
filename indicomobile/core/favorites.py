import indicomobile.db.event as db_event
import indicomobile.db.session as db_session
import indicomobile.db.contribution as db_contribution

def get_favorites_events(events, user_id):
    for event in events:
        event["favorite"] = db_event.is_favorite(event["id"], user_id)
    return events

def get_favorites_contributions(contributions, user_id):
    contribs_in_db = []
    for contribution in contributions:
        if 'conferenceId' in contribution:
            if db_event.get_favorites_event(user_id, contribution['conferenceId']):
                contribs_in_db.append(contribution)
            if 'slot' in contribution:
                if contribution['slot']:
                    session = contribution['slot']
                    if db_session.get_favorites_session(user_id, contribution['conferenceId'], session['sessionId']):
                        contribs_in_db.append(contribution)
            if db_contribution.get_favorites_contribution(user_id, contribution['conferenceId'], contribution['contributionId']):
                contribs_in_db.append(contribution)
        else:
            if db_event.get_favorites_event(user_id, contribution['id']):
                contribs_in_db.append(contribution)
    return contribs_in_db

def is_contribution_favorite(contribution, user_id):
    if 'conferenceId' in contribution:
        if db_event.is_favorite(user_id, contribution['conferenceId']):
            return True
        if 'slot' in contribution:
            if contribution['slot']:
                session = contribution['slot']
                if db_session.is_favorite(contribution['conferenceId'], session['sessionId'], user_id):
                    return True
        if db_contribution.is_favorite(contribution['conferenceId'], contribution['contributionId'], user_id):
            return True
        return False
    # Lectures
    else:
        return db_event.is_favorite(contribution['id'], user_id)
