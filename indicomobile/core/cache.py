from flask_cache import Cache
from flask import session as session, request

cache = None

def setup_caching(app):
    global cache
    cache = Cache(app)

def make_cache_key(*args, **kwargs):
    path = request.path
    args = str(hash(frozenset(request.args.items())))
    return (path + args + session.get("indico_user", "all_public")).encode('utf-8')
