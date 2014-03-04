"""
Copyright (C) 2013 Ivan Yurchenko

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
"""

from __future__ import absolute_import

import uuid
import pickle
from datetime import timedelta
from flask.sessions import SessionInterface, SessionMixin
from werkzeug.datastructures import CallbackDict
from redis import StrictRedis
from dateutil.parser import parse
from indicomobile.util.date_time import nowutc


class IndicoMobileSession(CallbackDict, SessionMixin):

    def __init__(self, initial=None, sid=None, new=True):
        def on_update(this):
            this.modified = True
        CallbackDict.__init__(self, initial, on_update)
        self.sid = sid
        self.new = new
        self.modified = False


class IndicoMobileSessionInterfaceBasic(SessionInterface):

    temporary_session_lifetime = timedelta(days=7)

    def generate_sid(self):
        return uuid.uuid4().hex

    def get_storage_expiration_time(self, app, session):
        if session.permanent:
            return int(session.get("oauth_token_ttl"))
        else:
            return self.temporary_session_lifetime

    def get_expiration_time(self, app, session):
        if session.permanent:
            return parse(session.get("oauth_token_expiration_timestamp"))

    def open_session(self, app, request):
        sid = request.cookies.get(app.session_cookie_name)
        if not sid:
            return self.session_class(sid=self.generate_sid(), new=True)
        stored_session = self._get_session(sid)
        if stored_session is not None:
            if (stored_session.get("oauth_token_expiration_timestamp")):
                if parse(stored_session.get("oauth_token_expiration_timestamp")) > nowutc():
                    return self.session_class(stored_session, sid=sid)
            else:
                    return self.session_class(stored_session, sid=sid)
        return self.session_class(sid=self.generate_sid(), new=True)

    def save_session(self, app, session, response):
        domain = self.get_cookie_domain(app)
        if not session:
            self._delete_session(session)
            if session.modified:
                response.delete_cookie(key=app.session_cookie_name, domain=domain)
            return

        cookie_exp = self.get_expiration_time(app, session)
        session_exp = self.get_storage_expiration_time(app, session)
        self._store_session(session, session_exp)

        response.set_cookie(key=app.session_cookie_name, value=session.sid, expires=cookie_exp,
                            secure=self.get_cookie_secure(app), httponly=self.get_cookie_httponly(app), domain=domain)


class IndicoMobileSessionInterface(IndicoMobileSessionInterfaceBasic):
    serializer = pickle
    session_class = IndicoMobileSession

    def __init__(self, redis_url, prefix='session:'):
        self._redis_client = StrictRedis.from_url(redis_url)
        self._redis_client.connection_pool.connection_kwargs['socket_timeout'] = 5
        self._prefix = prefix

    def _get_session(self, sid):
        stored_session = self._redis_client.get(self._prefix + sid)
        if stored_session:
            return self.serializer.loads(stored_session)
        return None

    def _store_session(self, session, ttl):
        val = self.serializer.dumps(dict(session))
        self._redis_client.setex(self._prefix + session.sid, ttl, val)

    def _delete_session(self, session):
        self._redis_client.delete(self._prefix + session.sid)


def register_session_interface(app):
    if app.config.get("SESSION_INTERFACE") == "redis" and app.config.get("REDIS_SERVER_URL"):
        app.session_interface = IndicoMobileSessionInterface(app.config.get("REDIS_SERVER_URL"))
