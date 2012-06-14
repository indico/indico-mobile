import datetime
from pytz import utc, timezone
from flask import json, current_app
from mongoalchemy.document import Document
from bson import ObjectId, DBRef


PATCHED = False


class _JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        app_tz = timezone(current_app.config.get('TIMEZONE', 'UTC'))
        if isinstance(obj, Document):
            return obj.fields()
        elif isinstance(obj, datetime.datetime):
            return {
                'date': utc.localize(obj).astimezone(app_tz).strftime('%Y-%m-%d'),
                'time': utc.localize(obj).astimezone(app_tz).strftime('%H:%M:%S'),
                'tz': utc.localize(obj).astimezone(app_tz).strftime('%Z')
                }
        elif isinstance(obj, ObjectId):
            return getattr(obj, 'id', None)
        elif isinstance(obj, DBRef):
            return null

        return json.JSONEncoder.default(self, obj)


_old_dumps = json.dumps


def patch_json():
    """
    Monkey-patch default JSON lib as to allow serializing MongoKit objs
    """
    global PATCHED

    if PATCHED:
        return

    def _json_dumps(*args, **kwargs):
        kwargs['cls'] = _JSONEncoder
        return _old_dumps(*args, **kwargs)

    json.dumps = _json_dumps
    PATCHED = True
