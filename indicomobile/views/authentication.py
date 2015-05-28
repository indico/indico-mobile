from flask import Blueprint, flash, json, redirect, request, Response, session, url_for
from flask.ext.oauthlib.contrib.client import OAuth, OAuth1Application
from flask.ext.oauthlib.contrib.client.exceptions import OAuthException
from flask.ext.oauthlib.contrib.client.structure import OAuth1Response
from werkzeug.exceptions import BadRequest, Unauthorized

from indicomobile import app
from indicomobile.views.errors import generic_error_handler


class CertOAuth1Application(OAuth1Application):
    def make_oauth_session(self, **kwargs):
        oauth = super(CertOAuth1Application, self).make_oauth_session(**kwargs)
        oauth.verify = app.config.get('CERT_FILE', True)
        return oauth


oauth_blueprint = _bp = Blueprint('oauth_blueprint', __name__, template_folder='templates')

oauth = OAuth(app)
indico = oauth.add_remote_app(CertOAuth1Application('indico'),
                              name='indico',
                              version='1',
                              endpoint_url=app.config['INDICO_URL'],
                              request_token_url=app.config['REQUEST_TOKEN_URL'],
                              access_token_url=app.config['ACCESS_TOKEN_URL'],
                              authorization_url=app.config['AUTHORIZE_URL'],
                              consumer_key=app.config['CONSUMER_KEY'],
                              consumer_secret=app.config['CONSUMER_SECRET'])


@indico.tokengetter
def oauth_indico_token():
    return session.get('indico_mobile_oauthtok')


@_bp.route('/login/', methods=['GET'])
def login():
    callback_uri = url_for('.oauth_authorized', next=request.args.get('next') or request.referrer or None,
                           _external=True)
    return indico.authorize(callback_uri)


@_bp.route('/oauth_authorized/', methods=['GET'])
def oauth_authorized():
    from indicomobile.core.indico_api import get_user_info  # is this necessary
    next_url = request.args.get('next') or url_for('routing.index')

    response = indico.authorized_response()
    if not response:
        session['unauthorized'] = True
        return redirect(url_for("routing.index"))

    session.permanent = True
    session["indico_mobile_oauthtok"] = (response.token, response.token_secret)
    session['unauthorized'] = False
    session['indico_user'] = response['user_id']
    session['oauth_token_expiration_timestamp'] = response['oauth_token_expiration_timestamp']
    session['oauth_token_ttl'] = int(response['oauth_token_ttl'])
    user_info = _get_user_info()
    session['indico_user_name'] = '{} {} {}'.format(user_info.get('title'), user_info.get('firstName'),
                                                    user_info.get('familyName'))
    return redirect(next_url)


@_bp.route('/logout/', methods=['GET'])
def logout():
    session.clear()
    if request.args.get('expired', False):
        flash("Your session has expired, you've been logged out")
    return redirect(request.referrer or url_for("routing.index"))


@_bp.route('/user/', methods=['GET'])
def user():
    return Response(json.dumps({'username': session.get('indico_user_name', '')}), mimetype='application/json')


@_bp.errorhandler(OAuthException)
def error(error):
    code = error.data["code"]
    if code == 401:
        exception = Unauthorized(error.data["message"])
    else:
        exception = BadRequest(error.data["message"])
    return generic_error_handler(exception)


def _get_user_info():
    response = indico.get('/api/user')
    return response.json()
