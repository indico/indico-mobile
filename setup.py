from setuptools import setup, find_packages
setup(
    name = "indico-mobile",
    version = "0.1",
    packages = find_packages(),

    install_requires = ['Flask==0.10.1', 'Flask-MongoAlchemy==0.5.4', 'Flask-Assets==0.8',
                        'Flask-MongoKit==0.6', 'Flask-Cache==0.12', 'Flask-OAuth==0.12', 'pytz==2013.9',
                        'lxml==3.3.1', 'jsmin==2.0.9', 'cssmin==0.2.0', 'redis==2.9.1', 'python-dateutil==2.2'],

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
