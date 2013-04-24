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
from flask import Blueprint, request, redirect, session, url_for, flash, json
from flask_oauth import OAuth
from indicomobile import app

oauth_client = Blueprint('oauth_client', __name__, template_folder='templates')
oauth = OAuth()
oauth_indico_mobile = oauth.remote_app('indico_mobile',
    base_url=app.config['INDICO_URL'],
    request_token_url=app.config['REQUEST_TOKEN_URL'],
    access_token_url=app.config['ACCESS_TOKEN_URL'],
    authorize_url=app.config['AUTHORIZE_URL'],
    consumer_key=app.config['CONSUMER_KEY'],
    consumer_secret=app.config['CONSUMER_SECRET']
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
    session.pop('indico_user', None)
    session.pop('indico_user_name', None)
    session.pop('indico_mobile_oauthtok', None)
    session.pop('unauthorized', None)
    if request.args.get("expired", False):
        flash("Your session has expired, you've been logged out.")
    return redirect(request.referrer or url_for("routing.index"))

def get_user_info(user_id):
    url = app.config['INDICO_URL'] + '/export/user/' + user_id + '.json'
    return oauth_indico_mobile.get(url).data["results"]

@oauth_client.route('/oauth_authorized/', methods=['GET'])
@oauth_indico_mobile.authorized_handler
def oauth_authorized(resp):
    next_url = request.args.get('next') or url_for('routing.index')
    if not resp:
        session['unauthorized'] = True
        return redirect(url_for("routing.index"))

    session["indico_mobile_oauthtok"] = (resp['oauth_token'], resp['oauth_token_secret'])
    session['unauthorized'] = False
    session['indico_user'] = resp['user_id']
    user_info = get_user_info(resp['user_id'])
    session['indico_user_name'] = "%s %s %s"%(user_info.get('title'), user_info.get('firstName'), user_info.get('familyName'))
    return redirect(next_url)

@oauth_client.route('/user/', methods=['GET'])
def user():
    return json.dumps({"username":session.get('indico_user_name', "")})



