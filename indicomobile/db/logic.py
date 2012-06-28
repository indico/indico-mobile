from datetime import datetime

from indicomobile.util.date_time import dt_from_indico
from indicomobile.db.base import ref
from indicomobile.db.schema import *


def convert_dates(dictionary):
    dictionary['startDate'] = dt_from_indico(dictionary['startDate'])
    dictionary['endDate'] = dt_from_indico(dictionary['endDate'])
    if 'modificationDate' in dictionary:
        dictionary['modificationDate'] = dt_from_indico(dictionary['modificationDate'])


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
    store_material(contribution)
    store_presenters(contribution)
    db_contribution = db.Contribution()
    db_contribution.update(contribution)
    db_contribution.save()

    return db_contribution


def store_slot(slot, event):
    convert_dates(slot)
    session_id = slot['sessionId']
    is_poster = slot['isPoster']
    slot_id = slot['id']
    color = slot['color']

    slot['event'] = ref(event)
    slot.pop('conveners')
    slot.pop('_type')

    db_slot = db.SessionSlot()
    db_slot.update(slot)
    db_slot['entries'] = []

    db_slot.save()

    entries = []

    for contribution, block_content in slot.get('entries', {}).iteritems():
        if block_content['_type'] == 'ContribSchEntry':
            entries.append(ref(store_contribution(block_content, event, color, is_poster, db_slot)))
    db_slot['entries'] = entries
    if len(db_slot['entries']) > 0:
        db_slot.save()
        store_material(slot)
    return db_slot


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


def store_chairs(event):
    chairs = []
    for chair_dict in event.get('chairs', []):
        chair = db.Chair()
        chair_dict['conferenceId'] = event.get('id')
        chair.update(chair_dict)
        chair.pop('_type')
        chairs.append(chair)
        chair.save()
    event['chairs'] = chairs


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


def store_event(event_http, event_tt):
    convert_dates(event_http)

    event_id = event_http['id']
    
    store_chairs(event_http)

    event_db = db.Event()
    event_db.update(event_http)
    event_db.pop('_type')
    event_db.save()

    for day, day_content in event_tt.get(event_id, {}).iteritems():
        entries = []

        for block, block_content in day_content.iteritems():
            if block_content['_type'] == 'LinkedTimeSchEntry':
                entry = store_slot(block_content, event_db)
            else:
                entry = store_contribution(block_content, event_db)
            entries.append(ref(entry))
        if len(day_content.keys()) > 0:
            date = datetime.strptime(day, '%Y%M%d').strftime('%Y-%M-%d').decode('utf-8')
            day = db.Day()
            day['date'] = date
            day['conferenceId'] = event_id
            day['entries'] = entries
            day.save()
