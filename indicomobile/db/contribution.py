from indicomobile.db import ref
from indicomobile.db.schema import db
from indicomobile.db.common import store_material
from indicomobile.util.date_time import convert_dates
from indicomobile.util.tools import clean_html_tags


def get_contribution(event_id, contrib_id):
    contribution = db.Contribution.find_one({'conferenceId': event_id, 'contributionId': contrib_id})
    contribution["event"] = db.dereference(contribution["event"])
    if contribution['slot']:
        contribution['slot'] = db.dereference(contribution['slot'])
    return contribution


def get_contributions(start_date, end_date, extra_args=[]):
    results = []
    query = [{"$or":
              [{"$and": [{'startDate': {'$gte': start_date}},
                         {'startDate': {'$lt': end_date}}]},
               {"$and": [{'endDate': {'$gte': start_date}},
                         {'endDate': {'$lt': end_date}}]}]}]
    query.extend(extra_args)
    contributions = db.Contribution.find({'$and': query}).sort([('startDate', 1)])
    for contribution in contributions:
        if contribution['slot']:
            contribution['slot'] = db.dereference(contribution['slot'])
        results.append(contribution)
    return results


def is_favorite(event_id, contribution_id, user_id):
    return db.FavoritesContribution.find_one({'contribution.conferenceId': event_id,
                                              'contribution.contributionId': contribution_id,
                                              'user_id': user_id}) is not None


def get_event_contributions(event_id, extra_args=[], include_slot=False, sort=False):
    results = []
    query = {'conferenceId': event_id}
    query.update(extra_args)
    contributions = db.Contribution.find(query)
    if sort:
        contributions = contributions.sort([('startDate', 1)])
    for contribution in contributions:
        if include_slot and contribution['slot']:
            contribution['slot'] = db.dereference(contribution['slot'])
        results.append(contribution)
    return results


def get_speaker_contributions(event_id, speaker):
    contributions = []
    contribs = db.Contribution.find({'$and': [{'presenters': {'$elemMatch': speaker}},
                                    {'conferenceId': event_id}]}).sort([('startDate', 1)])
    for contrib in contribs:
        if contrib['slot']:
            contrib['slot'] = db.dereference(contrib['slot'])
        contributions.append(contrib)
    return contributions


def store_presenters(contribution):
    presenters = []
    for presenter in contribution.get('presenters', []):
        presenter_id = presenter['name'] + presenter['email']
        presenter_db = db.Presenter.find_one({'id': presenter_id, 'conferenceId': contribution['conferenceId']})
        if not presenter_db:
            presenter['id'] = presenter_id
            presenter['conferenceId'] = contribution['conferenceId']
            presenter_db = db.Presenter()
            presenter_db.update(presenter)
            presenter_db = db.Presenter.find_and_modify({'id': presenter_id, 'conferenceId': contribution['conferenceId']}, presenter_db, upsert=True, new=True)
        presenters.append(presenter_db)
    contribution['presenters'] = presenters


def store_contribution(contribution, event, color=None, is_poster=False, slot=None):
    convert_dates(contribution)
    clean_html_tags(contribution)

    contribution.update({'isPoster': is_poster,
                         'slot': ref(slot) if slot else None,
                         'color': color})

    contribution.pop('id')
    contribution.pop('sessionId')
    contribution.pop('sessionSlotId')
    contribution.pop('sessionCode')
    contribution['event'] = ref(event)
    contribution['hasAnyProtection'] = event['hasAnyProtection']
    store_material(contribution)
    store_presenters(contribution)
    db_contribution = db.Contribution()
    db_contribution.update(contribution)
    return db.Contribution.find_and_modify({'conferenceId': db_contribution["conferenceId"], 'contributionId': db_contribution["contributionId"]}, db_contribution, upsert=True, new=True)


# AGENDA
def get_favorites_contribution(user_id, event_id, contrib_id):
    return db.FavoritesContribution.find_one({'user_id': user_id,
                                              'contribution.contributionId': contrib_id,
                                              'contribution.conferenceId': event_id})


def get_favorites_contributions(user_id, distinct=False):
    if distinct:
        return db.FavoritesContribution.find({'user_id': user_id}).distinct('contribution.conferenceId')
    return db.FavoritesContribution.find({'user_id': user_id})


def get_favorites_event_contributions(user_id, event_id, include_slots=False):
    contributions = db.FavoritesContribution.find({'user_id': user_id, 'contribution.conferenceId': event_id})
    results = []
    for contribution in contributions:
        if include_slots and contribution["contribution"]['slot']:
            pass
            #contribution["contribution"]['slot'] = db.dereference(contribution["contribution"]['slot'])
        results.append(contribution)
    return results


def get_num_favorites_event_contributions(user_id, event_id):
    return db.FavoritesContribution.find({'user_id': user_id, 'contribution.conferenceId': event_id}).count()


def add_contribution_to_favorites(user_id, contribution):
    new_contribution = db.FavoritesContribution()
    new_contribution.update({'user_id': user_id, 'contribution': contribution})
    db.FavoritesContribution.find_and_modify({'user_id': user_id, 'contribution.conferenceId': contribution["conferenceId"], 'contribution.contributionId': contribution["contributionId"]}, new_contribution, upsert=True)


def remove_contribution_from_favorites(user_id, event_id, contrib_id):
    db.favorites_contributions.remove({'user_id': user_id, 'contribution.conferenceId': event_id, 'contribution.contributionId': contrib_id})


def remove_event_contributions_from_favorites(user_id, event_id):
    db.favorites_contributions.remove({'user_id': user_id, 'contribution.conferenceId': event_id})
