from lxml import html

def clean_html_tags(obj):
    obj["title"] = unicode(html.fromstring(obj["title"]).text_content())
    description = obj.get('description', '').strip()
    if not description:
        description = '<p/>'
    obj["description"] = unicode(html.fromstring(description).text_content())