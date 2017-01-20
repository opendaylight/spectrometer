#!/usr/bin/python
# -*- coding: utf-8 -*-

# @License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
##############################################################################
# Copyright (c) 2015, 2016 Mohammed Hassan Zahraee and others.
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
##############################################################################

import logging
from logging.handlers import RotatingFileHandler
from multiprocessing import Pool
import os
import pickle
import tempfile

from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask
from flask.ext.profile import Profiler
from git.cmd import Git

from spectrometer import views
from spectrometer.api.gerrit import gerritapi
from spectrometer.api.git import gitapi
from spectrometer.handlers.gerrit import GerritHandler

log = logging.getLogger(__name__)


def create_app(config):
    app = Flask(__name__)
    config = os.path.abspath(config)
    app.config.from_pyfile(config)
    app.debug = app.config.get('DEBUG', False)

    # Setup semi-permanent cache stored in os temp directory
    try:
        app.cache_file = os.path.join(
            tempfile.gettempdir(), 'spectrometer-cache.p')
        app.cache = pickle.load(open(app.cache_file, "rb"))
    except IOError:
        app.cache = {}

    # Flask profiler is only active when in debug mode
    profiler = Profiler()
    profiler.init_app(app)

    if not app.debug:
        # Setup Logger
        logdir = app.config.get('LOG_DIR', '/var/log/spectrometer')
        logfile = os.path.join(logdir, 'spectrometer.log')

        logging.getLogger().setLevel(logging.NOTSET)
        logging.getLogger('git.cmd').setLevel(logging.INFO)
        formatter = logging.Formatter('%(asctime)s (%(levelname)8s) %(name)-40s: %(message)s')
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logging.getLogger().addHandler(console_handler)

        try:
            file_handler = RotatingFileHandler(logfile, maxBytes=20000000, backupCount=20)
            file_handler.setFormatter(formatter)
            logging.getLogger().addHandler(file_handler)
            log.info('File logger activated.')
        except IOError:
            log.warn('Unable to activate File logger. Please ensure that the '
                     'log directory ({0}) is writable by the spectrometer user.'.format(logdir))

    # Prep resource handlers
    app.gerrithandler = GerritHandler(app.config['GERRIT_URL'])
    app.githandlers = {}

    # Stop Flask debug mode from running the scheduler twice
    if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        run_scheduler(app)

    app.route('/')(views.status)

    app.register_blueprint(gitapi, url_prefix='/git')
    app.register_blueprint(gerritapi, url_prefix='/gerrit')

    return app


def update_repo(project, mirror_dir, gerrit_url):
    """Utility function to mirror git repo

    Arguments:
        :arg str project: Git project to mirror
        :arg str mirror_dir: Path to directory containing repos.
        :arg str gerrit_url: URL to the Gerrit server. Used for cloning repos.
    """
    log.debug("Updating repo for {0}".format(project))
    project_dir = os.path.join(mirror_dir, '{0}.git'.format(project))

    if os.path.exists(project_dir):
        args = ['git', 'fetch']
    else:
        os.makedirs(project_dir)
        args = ['git', 'clone', '--mirror',
                '{0}/{1}'.format(gerrit_url, project), '.']

    project_repo = Git(project_dir)
    project_repo.execute(args)


def update_repo_parallel(args):
    """Helper function to parallelize the update_repo() function"""
    return update_repo(*args)


def mirror_repos(mirror_dir, gerrit_url):
    """Updates repository mirrors

    This function creates a multiprocessing pool that will parallelize the
    repo mirroring process. It will create as many worker threads as there are
    cpus on the system.

    Arguments:

        :arg str mirror_dir: Path to directory containing repos.
        :arg str gerrit_url: URL to the Gerrit server. Used for cloning repos.
    """
    log.info('Updating git mirrors.')
    gerrit = GerritHandler(gerrit_url)
    projects = gerrit.projects_list()

    pool = Pool()
    jobs = [(project, mirror_dir, gerrit_url) for project in projects]
    pool.map(update_repo_parallel, jobs)
    pool.close()
    pool.join()


def run_scheduler(app):
    """Runs a APScheduler instance to handle tasks"""
    mirror_interval = app.config.get('MIRROR_INTERVAL', 300)

    apsched = BackgroundScheduler()
    apsched.start()

    # Update git mirrored repos every 5 minutes
    args = {
        'mirror_dir': app.config['MIRROR_DIR'],
        'gerrit_url': app.config['GERRIT_URL'],
    }
    apsched.add_job(mirror_repos, 'interval', seconds=mirror_interval, kwargs=args)

    args = {
        'cache_file': app.cache_file,
        'cache': app.cache,
    }
    apsched.add_job(save_cache, 'interval', seconds=300, kwargs=args)


def run_app(config='/etc/spectrometer/config.py'):
    """Runs the spectrometer app

    This function is effectively the spectrometer main() function and is the
    entry point for spectrometer.
    """
    app = create_app(config)

    return app


def save_cache(cache_file, cache):
    """Saves the Spectrometer cache to disk"""
    log.info("Saving cache to file {0}".format(cache_file))
    pickle.dump(cache, open(cache_file, "wb"))
