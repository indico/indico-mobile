"""
The MIT License

Copyright (c) 2007 Leah Culver

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

Example consumer. This is not recommended for production.
Instead, you'll want to create your own subclass of OAuthClient
or find one that works with your web framework.
"""

import urllib2
from flask import Blueprint, request, redirect, session, url_for, json, current_app, render_template, session as flask_session
from flaskext.oauth import OAuth
from indicomobile.core.indico_api import sign_request

oauth_client = Blueprint('oauth_client', __name__, template_folder='templates')

REQUEST_TOKEN_URL='http://pcuds43.cern.ch/indico/oauth.py/request_token'
ACCESS_TOKEN_URL='http://pcuds43.cern.ch/indico/oauth.py/access_token'
AUTHORIZE_URL='http://pcuds43.cern.ch/indico/oauth.py/authorize'
CONSUMER_KEY='tjjOA7kYWJ0SUNBAVX3yCqke65DSjd1ZA1fIt8vK'
CONSUMER_SECRET='0NhCRMMZcJzYQPz82otCZp4TdxXkveJ0dLSbdFrF'

oauth = OAuth()
oauth_indico_mobile = oauth.remote_app('indico_mobile',
    base_url='http://pcuds43.cern.ch/indico/',
    request_token_url=REQUEST_TOKEN_URL,
    access_token_url=ACCESS_TOKEN_URL,
    authorize_url=AUTHORIZE_URL,
    consumer_key=CONSUMER_KEY,
    consumer_secret=CONSUMER_SECRET
)

@oauth_indico_mobile.tokengetter
def get_token():
    return session.get('indico_mobile_token')


@oauth_client.route('/login/', methods=['GET'])
def login():
    return oauth_indico_mobile.authorize(callback=urllib2.unquote(url_for('.oauth_authorized',
        next=request.args.get('next') or request.referrer or None, _external=True)))

@oauth_client.route('/logout/', methods=['GET'])
def logout():
    expired = request.args.get('expired', False)
    flask_session['access_token'] = None
    flask_session['indico_user'] = None
    flask_session['indico_user_name'] = 'None'
    return render_template('index.html', access_token_expired=expired)


def get_user_info(user_id):
    at_key = session['access_token'].get('key')
    at_secret = session['access_token'].get('secret')
    path = '/export/user/' + user_id + '.json'
    params = {
        'nocache': 'yes'
    }
    url = current_app.config['SERVER_URL'] + sign_request(path, params, at_key, at_secret)
    req = urllib2.Request(url)
    opener = urllib2.build_opener()
    f = opener.open(req)
    return json.load(f)['results']



@oauth_client.route('/oauth_authorized/', methods=['GET'])
@oauth_indico_mobile.authorized_handler
def oauth_authorized(resp):
    next_url = request.args.get('next') or url_for('index')
    if resp is None:
        session['unauthorized'] = True
        return redirect('/')

    session['unauthorized'] = False

    session['access_token'] = {
        'key': resp['oauth_token'],
        'secret': resp['oauth_token_secret']
    }
    session['indico_user'] = resp['user_id']
    user_info = get_user_info(resp['user_id'])
    session['indico_user_name'] = user_info.get('title') + ' ' + user_info.get('familyName')
    return redirect('/')
