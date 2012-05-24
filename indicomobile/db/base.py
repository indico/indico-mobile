import copy
from flaskext.mongoalchemy import MongoAlchemy

from indicomobile.app import app


app.config['MONGOALCHEMY_DATABASE'] = 'library'
db = MongoAlchemy(app)


class DBClass(db.Document):

    def get_list(self, field):
        res = []
        for e in self._field_values[field]:
            if (type(e) != type(unicode())):
                fields = e.fields()
                for k, v in fields.iteritems():
                    if isinstance(v, list):
                        fields[k] = e.get_list(k)
                res.append(fields)
            else:
                res.append(e)
        return res

    def fields(self):
        field_values = copy.copy(self._field_values)
        field_values.pop('mongo_id', None)
        if 'presenters' in field_values:
            field_values['presenters'] = self.get_list('presenters')
        if 'material' in field_values:
            field_values['material'] = self.get_list('material')
        if 'chairs' in field_values:
            field_values['chairs'] = self.get_list('chairs')
        return field_values
