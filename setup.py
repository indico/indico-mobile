from setuptools import setup, find_packages
setup(
    name = "indico-mobile",
    version = "0.1",
    packages = find_packages(),

    install_requires = ['flask', 'Flask-mongoalchemy', 'Flask-assets', 'flask-mongokit', 'Flask-Cache', 'Flask-OAuth',
                        'pytz', 'lxml', 'uwsgi', 'jsmin', 'cssmin', 'redis', 'python-dateutil'],

    package_data = {
        '': ['*.txt', '*.rst', '*.html']
    },

    author = "Indico Team",
    author_email = "indico-team@cern.ch",
    description = "Indico Mobil Interface",
    license = "GPL3",
    keywords = "indico mobile interface",
    url = "http://indico-software.org/",
    include_package_data = True
)
