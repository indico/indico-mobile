from indicomobile.db import ref
from indicomobile.db.schema import db
from indicomobile.util.date_time import convert_dates

def get_contribution(event_id, contrib_id):
    contribution = db.Contribution.find_one({'conferenceId': event_id, 'contributionId': contrib_id})
    if contribution['slot']:
        contribution['slot'] = db.dereference(contribution['slot'])
    return contribution

def get_contributions(start_date, end_date, extra_args = []):
    results = []
    query = [{'startDate': {'$gte': start_date}},
              {'startDate': {'$lt': end_date}}]
    query.extend(extra_args)
    contributions = db.Contribution.find({'$and': query}).sort([('startDate', 1)])
    for contribution in contributions:
        if contribution['slot']:
            contribution['slot'] = db.dereference(contribution['slot'])
        results.append(contribution)
    return results

def get_event_contributions(event_id, extra_args = [], include_slot= False, sort = False):
    results = []
    query = {'conferenceId': event_id }
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

def search_contributions(event_id, session_id, start_date, end_date, regex):
    contributions = []
    results = db.Contribution.find({'$and': [{'title': {'$regex': regex, '$options': 'i'}},
                                        {'conferenceId': event_id},
                                        {'startDate': {'$gte': start_date}},
                                        {'startDate': {'$lt': end_date}}]}).sort([('startDate', 1)])
    for contrib in results:
        if contrib['slot']:
            contrib['slot'] = db.dereference(contrib['slot'])
            if session_id:
                if contrib['slot']['sessionId'] == session_id:
                    contributions.append(contrib)
            else:
                contributions.append(contrib)
        elif not session_id:
            contributions.append(contrib)
    return contributions


def store_material(block):
    materials = []
    for material_dict in block.get('material', []):
        resources = []

        for resource_dict in material_dict.get('resources', []):
            resource_dict.pop('_type')
            resource_dict['conferenceId'] = block.get('conferenceId')
            resource = db.Resource()
            resource.update(resource_dict)
            resources.append(resource)
            resource.save()

        material_dict['resources'] = resources
        material_dict.pop('_type')
        material_dict['conferenceId'] = block.get('conferenceId')
        material = db.Material()
        material.update(material_dict)
        materials.append(material)
        material.save()
    block['material'] = materials


def store_presenters(contribution):
    presenters = []
    for presenter in contribution.get('presenters', []):
        presenter_id = presenter['name'] + presenter['email']
        presenter_db = db.Presenter.find_one({'id': presenter_id, 'conferenceId': contribution['conferenceId']})
        if not presenter_db:
            presenter.pop('_type')
            presenter['id'] = presenter_id
            presenter['conferenceId'] = contribution['conferenceId']
            presenter_db = db.Presenter()
            presenter_db.update(presenter)
            presenter_db.save()
        presenters.append(presenter_db)
    contribution['presenters'] = presenters


def store_contribution(contribution, event, color=None, is_poster=False, slot=None):
    convert_dates(contribution)

    contribution.update({
            'isPoster': is_poster,
            'slot': ref(slot) if slot else None,
            'color': color})

    contribution.pop('id')
    contribution.pop('_type')
    contribution.pop('sessionId')
    contribution.pop('sessionSlotId')
    contribution.pop('sessionCode')
    contribution['event'] = ref(event)
    contribution['hasAnyProtection'] = event['hasAnyProtection']
    store_material(contribution)
    store_presenters(contribution)
    db_contribution = db.Contribution()
    db_contribution.update(contribution)
    db_contribution.save()
    return db_contribution

# AGENDA

def get_agenda_contribution(user_id, event_id, contrib_id):
    return db.AgendaContribution.find_one({'user_id': user_id,
                                                'contribution.contributionId': contrib_id,
                                                'contribution.conferenceId': event_id})

def get_agenda_contributions(user_id, distinct = False):
    if distinct:
        return db.AgendaContribution.find({'user_id': user_id}).distinct('contribution.conferenceId')
    return db.AgendaContribution.find({'user_id': user_id})


def get_agenda_event_contributions(user_id, event_id, include_slots = False):
    contributions = db.AgendaContribution.find({'user_id': user_id, 'contribution.conferenceId': event_id})
    results = []
    for contribution in contributions:
        if include_slots and contribution['slot']:
            contribution['slot'] = db.dereference(contribution['slot'])
        results.append(contribution)
    return results


def get_num_agenda_event_contributions(user_id, event_id):
    return db.AgendaContribution.find({'user_id': user_id, 'contribution.conferenceId': event_id}).count()

def add_contribution_to_agenda(user_id, contribution):
    new_contribution = db.AgendaContribution()
    new_contribution.update({'user_id': user_id, 'contribution': contribution})
    new_contribution.save()

def remove_contribution_from_agenda(user_id, event_id, contrib_id):
    db.agenda_session_slots.remove({'user_id': user_id, 'session_slot.conferenceId': event_id, 'contribution.sessionId': contrib_id})


def remove_event_contributions_from_agenda(user_id, event_id):
    db.agenda_contributions.remove({'user_id': user_id, 'contribution.conferenceId': event_id})
