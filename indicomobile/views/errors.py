from flask import render_template
from lxml import html

def generic_error_handler(error):
    view = {
        "code": error.code,
        "description": html.fromstring(error.description).text_content(),
        "name": error.name,
    }

    try:
        return render_template("errors/%d.html" % error.code, **view), error.code
    except:
        return render_template("errors/generic.html", **view), error.code

def register_errors(app):
    for error in range(400, 420) + range(500,506):
        app.error_handler_spec[None][error] = generic_error_handler