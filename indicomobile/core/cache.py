from flask_cache import Cache

cache = None

def setup_caching(app):
    global cache
    cache = Cache(app)