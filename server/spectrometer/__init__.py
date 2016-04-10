#!/usr/bin/python
# -*- coding: utf-8 -*-

# @License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
##############################################################################
# Copyright (c) 2015 Mohammed Hassan Zahraee and others.
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
##############################################################################

from flask import Flask
from flask.ext.pymongo import PyMongo

from spectrometer import views
from spectrometer.api.gerrit import gerritapi
from spectrometer.api.git import gitapi


def create_app(config):
    app = Flask(__name__)
    app.config.from_pyfile(config)

    app.mongo = PyMongo(app)

    app.route('/')(views.status)

    app.register_blueprint(gitapi, url_prefix='/git')
    app.register_blueprint(gerritapi, url_prefix='/gerrit')

    return app
