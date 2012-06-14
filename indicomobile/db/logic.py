from datetime import datetime

from indicomobile.util.date_time import dt_from_indico
from indicomobile.db.base import ref
from indicomobile.db.schema import *


def convert_dates(dictionary):
    dictionary['startDate'] = dt_from_indico(dictionary['startDate'])
    dictionary['endDate'] = dt_from_indico(dictionary['endDate'])
    if 'modificationDate' in dictionary:
        dictionary['modificationDate'] = dt_from_indico(dictionary['modificationDate'])


def store_contribution(contribution, color=None, is_poster=False, slot=None):
    convert_dates(contribution)

    contribution.update({
            'isPoster': is_poster,
            'slot': slot,
            'color': color})

    contribution.pop('id')
    contribution.pop('sessionId')
    contribution.pop('sessionSlotId')
    contribution.pop('sessionCode')

    store_material(contribution)
    store_presenters(contribution)
    db_contribution = Contribution(**contribution)
    db_contribution.save()

    return db_contribution


def store_slot(slot, event):
    convert_dates(slot)

    session_id = slot['sessionId']
    is_poster = slot['isPoster']
    slot_id = slot['id']
    color = slot['color']

    slot['event'] = event

    slot.pop('entries')
    slot.pop('conveners')

    db_slot = SessionSlot(**slot)

    db_slot.entries = []

    for contribution, block_content in slot.get('entries', {}).iteritems():
        if block_content['_type'] == 'ContribSchEntry':
            db_slot.entries.append(store_contribution(block_content, color, is_poster, db_slot))

    db_slot.save()

    store_material(slot)
    return db_slot


def store_material(block):
    materials = []
    for material_dict in block.get('material', []):
        resources = []

        for resource_dict in material_dict.get('resources', []):
            resource = Resource(**resource_dict)
            resources.append(resource)
            resource.save()

        material_dict['resources'] = resources
        material = Material(**material_dict)
        materials.append(material)
        material.save()
    block['material'] = materials


def store_chairs(event):
    chairs = []
    for chair_dict in event.get('chairs', []):
        chair = Chair(**chair_dict)
        chairs.append(chair)
        chair.save()
    event['chairs'] = chairs


def store_presenters(contribution):
    presenters = []
    for presenter in contribution.get('presenters', []):
        presenter_db = Presenter.query.filter(Presenter.email == presenter['email']).first()
        if not presenter_db:
            presenter_db = Presenter(**presenter)
            presenter_db.save()
        presenters.append(presenter_db)
    contribution['presenters'] = presenters


def store_event(event_http, event_tt):
    convert_dates(event_http)

    event_id = event_http['id']

    event_db = Event(**event_http)

    for day, day_content in event_tt.get(event_id, {}).iteritems():
        entries = []

        for block, block_content in day_content.iteritems():
            if block_content['_type'] == 'LinkedTimeSchEntry':
                entry = store_slot(block_content, event_db)
            else:
                entry = store_contribution(block_content)
            entries.append(ref(entry))
        day = Day(date=datetime.strptime(day, '%Y%M%d'), eventId=event_id)
        day.entries = entries
        day.save()
    store_chairs(event_http)
    event_db.save()
