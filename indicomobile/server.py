def setup_blueprints(app):
    from indicomobile.routing import routing
    from indicomobile.events import events
    from indicomobile.agenda import agenda
    from indicomobile.oauth_client import oauth_client

    app.register_blueprint(routing)
    app.register_blueprint(events)
    app.register_blueprint(agenda)
    app.register_blueprint(oauth_client)
