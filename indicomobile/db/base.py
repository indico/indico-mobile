import sys

from bson.dbref import DBRef
from indicomobile.app import app
import traceback


app.config['MONGODB_DATABASE'] = 'library'

if app.config.get('MONGODB_DATABASE'):
    from flask.ext.mongokit import MongoKit
    db = MongoKit(app)
else:
    from mongokit import Connection
    db = Connection()

def ref(doc):
    return DBRef(collection=doc.__collection__,
                id=doc['_id'],
                database='library')
