from datetime import datetime
from pytz import timezone


def dt_to_indico():
    pass


def dt_from_indico(dt_dict):
    dt = datetime.combine(datetime.strptime(dt_dict['date'], "%Y-%m-%d"),
                          datetime.strptime(dt_dict['time'].split('.')[0], "%H:%M:%S").time())
    return timezone(dt_dict['tz']).localize(dt)


def convert_dates(dictionary):
    dictionary['startDate'] = dt_from_indico(dictionary['startDate'])
    dictionary['endDate'] = dt_from_indico(dictionary['endDate'])
    if 'modificationDate' in dictionary:
        dictionary['modificationDate'] = dt_from_indico(dictionary['modificationDate'])


def nowutc():
    return timezone('UTC').localize(datetime.utcnow())
