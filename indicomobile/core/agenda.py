import indicomobile.db.event as db_event
import indicomobile.db.session as db_session
import indicomobile.db.contribution as db_contribution

def get_agenda_events(events, user_id):
    events_in_db = []
    for event in events:
        if db_event.get_agenda_event(user_id, event["id"]):
            events_in_db.append(event)
    return events_in_db

def get_agenda_contributions(contributions, user_id):
    contribs_in_db = []
    for contribution in contributions:
        if 'conferenceId' in contribution:
            if db_event.get_agenda_event(user_id, contribution['conferenceId']):
                contribs_in_db.append(contribution)
            if 'slot' in contribution:
                if contribution['slot']:
                    session = contribution['slot']
                    if db_session.get_agenda_session(user_id, contribution['conferenceId'], session['sessionId']):
                        contribs_in_db.append(contribution)
            if db_contribution.get_agenda_contribution(user_id, contribution['conferenceId'], contribution['contributionId']):
                contribs_in_db.append(contribution)
        else:
            if db_event.get_agenda_event(user_id, contribution['id']):
                contribs_in_db.append(contribution)
    return contribs_in_db