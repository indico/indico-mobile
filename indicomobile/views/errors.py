from flask import render_template

def generic_error_handler(error):
    view = {
        "code": error.code,
        "description": error.description,
        "name": error.name,
    }
    return render_template("errors/error.html", **view), error.code

def register_errors(app):
    for error in range(400, 420) + range(500,506):
        app.error_handler_spec[None][error] = generic_error_handler