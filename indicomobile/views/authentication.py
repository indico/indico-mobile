from datetime import datetime, timedelta

from flask import Blueprint, flash, json, redirect, request, Response, session, url_for
from flask_oauthlib.contrib.client import OAuth, OAuth2Application
from flask_oauthlib.contrib.client.exceptions import OAuthException
from werkzeug.exceptions import BadRequest, Unauthorized

from indicomobile import app
from indicomobile.views.errors import generic_error_handler


class CertOAuth2Application(OAuth2Application):
    def make_oauth_session(self, **kwargs):
        oauth = super(CertOAuth2Application, self).make_oauth_session(**kwargs)
        oauth.verify = app.config.get('CERT_FILE', True)
        return oauth


oauth_blueprint = _bp = Blueprint('oauth_blueprint', __name__, template_folder='templates')

oauth = OAuth(app)
indico = oauth.add_remote_app(CertOAuth2Application('indico'),
                              name='indico',
                              version='2',
                              endpoint_url=app.config['INDICO_URL'],
                              access_token_url=app.config['ACCESS_TOKEN_URL'],
                              authorization_url=app.config['AUTHORIZE_URL'],
                              client_id=app.config['CLIENT_ID'],
                              client_secret=app.config['CLIENT_SECRET'],
                              scope=['read:user read:legacy_api'])


@indico.tokensaver
def store_oauth_indico_token(token):
    session['indico_mobile_oauthtok'] = token


@indico.tokengetter
def obtain_oauth_indico_token():
    return session.get('indico_mobile_oauthtok')


@_bp.route('/login/', methods=['GET'])
def login():
    callback_uri = url_for('.oauth_authorized', _external=True)
    return indico.authorize(callback_uri, state=request.args.get('next') or request.referrer or None)


@_bp.route('/oauth_authorized/', methods=['GET'])
def oauth_authorized():
    default_expiry = timedelta(days=30)
    next_url = request.args.get('state') or url_for('routing.index')

    response = indico.authorized_response()
    if not response:
        session['unauthorized'] = True
        return redirect(url_for("routing.index"))

    session.permanent = True
    store_oauth_indico_token(response)
    session['unauthorized'] = False
    session['oauth_token_expiration_timestamp'] = response.get('expires_at', str(datetime.utcnow() + default_expiry))
    session['oauth_token_ttl'] = int(response.get('expires_in', default_expiry.total_seconds()))
    user_info = _get_user_info()
    session['indico_user'] = user_info['id']
    session['indico_user_name'] = '{0[first_name]} {0[last_name]}'.format(user_info)
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
