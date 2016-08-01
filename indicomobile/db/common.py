from indicomobile.db.schema import db

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
