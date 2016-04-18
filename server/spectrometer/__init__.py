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

import argparse
import os

from apscheduler.schedulers.background import BackgroundScheduler
from flask import Flask
from flask.ext.pymongo import PyMongo

from spectrometer import views
from spectrometer.api.gerrit import gerritapi
from spectrometer.api.git import gitapi
from spectrometer.datacollector import collect_n_store


def create_app(config):
    app = Flask(__name__)
    app.config.from_pyfile(config)

    app.mongo = PyMongo(app)
    run_scheduler(app.config)

    app.route('/')(views.status)

    app.register_blueprint(gitapi, url_prefix='/git')
    app.register_blueprint(gerritapi, url_prefix='/gerrit')

    return app


def run_scheduler(config):
    """Runs a APScheduler instance to handle tasks"""
    apsched = BackgroundScheduler()
    apsched.start()

    cache_config = {
        'repositories_yaml': config['REPOSITORY_ADDRESSES'],
        'mongo_host': config['MONGO_HOST'],
        'mongo_port': config['MONGO_PORT'],
    }
    apsched.add_job(collect_n_store, 'interval', seconds=300, kwargs=cache_config)


def run_app(cli=False):
    """Runs the spectrometer app

    This function is effectively the spectrometer main() function and is the
    entry point for spectrometer.
    """
    if cli:
        parser = argparse.ArgumentParser()
        parser.add_argument("-c", "--conf", help="Config file")
        args = parser.parse_args()

    # Config search priorities
    # 1. User provided via --conf parameter
    # 2. /etc/spectrometer/config.py
    config = '/etc/spectrometer/config.py'
    if cli and args.conf:  # If initiated by gunicorn don't parse cli
        config = os.path.realpath(args.conf)

    app = create_app(config)

    return app
