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
import os

from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask
from flask.ext.pymongo import PyMongo
from git.cmd import Git

from spectrometer import views
from spectrometer.api.gerrit import gerritapi
from spectrometer.api.git import gitapi
from spectrometer.handlers.gerrit import GerritHandler

log = logging.getLogger(__name__)


def create_app(config):
    app = Flask(__name__)
    app.config.from_pyfile(config)
    app.debug = app.config.get('DEBUG', False)

    if not app.debug:
        # Setup Logger
        logdir = app.config.get('LOG_DIR', '/var/log/spectrometer')
        logfile = os.path.join(logdir, 'spectrometer.log')

        logging.getLogger().setLevel(logging.NOTSET)
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

    app.mongo = PyMongo(app)

    # Stop Flask debug mode from running the scheduler twice
    if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        run_scheduler(app)

    app.route('/')(views.status)

    app.register_blueprint(gitapi, url_prefix='/git')
    app.register_blueprint(gerritapi, url_prefix='/gerrit')

    return app


def mirror_repos(mirror_dir, gerrit_url):
    """Updates repository mirrors

    Arguments:

        :arg str mirror_dir: Path to directory containing repos.
        :arg str gerrit_url: URL to the Gerrit server. Used for cloning repos.
    """
    log.info('Updating git mirrors.')
    gerrit = GerritHandler(gerrit_url)
    projects = gerrit.projects_list()

    for project in projects:
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


def run_app(config='/etc/spectrometer/config.py'):
    """Runs the spectrometer app

    This function is effectively the spectrometer main() function and is the
    entry point for spectrometer.
    """
    app = create_app(config)

    return app
