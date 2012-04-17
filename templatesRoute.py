from flask import Blueprint, render_template

templatesRoute = Blueprint('templatesRoute',
                           __name__,
                           template_folder='templates')


@templatesRoute.route('/home')
def index():
    return render_template('index.html')


@templatesRoute.route('/agenda')
def agenda():
    return render_template('agendaEvent.html')


@templatesRoute.route('/events')
def event():
    return render_template('events.html')


@templatesRoute.route('/search')
def search():
    return render_template('search.html')


@templatesRoute.route('/history')
def history():
    return render_template('history.html')


@templatesRoute.route('/contributionTemplates')
def contributionTemplates():
    return render_template('backboneTemplates/contributionTemplates.html')


@templatesRoute.route('/sessionTemplates')
def sessionTemplates():
    return render_template('backboneTemplates/sessionTemplates.html')


@templatesRoute.route('/dayTemplates')
def dayTemplates():
    return render_template('backboneTemplates/dayTemplates.html')


@templatesRoute.route('/eventTemplates')
def eventTemplates():
    return render_template('backboneTemplates/eventTemplates.html')


@templatesRoute.route('/')
def root():
    return render_template('root.html')
