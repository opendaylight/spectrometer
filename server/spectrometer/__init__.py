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

"""

@authors: Mohammed Hassan Zahraee
@status: Development
@version: 1.0

__init__.py: init

"""

from flask import Flask

from spectrometer.views import gerrit_stat
from spectrometer.views import git_stat
from spectrometer.views import hello_world


def create_app(config):
    app = Flask(__name__)
    app.config.from_pyfile(config)

    app.route('/')(hello_world)
    app.route('/git/<module_name>')(git_stat)
    app.route('/git/<module_name>/<path:branch_name>')(git_stat)
    app.route('/gerrit/<module_name>')(gerrit_stat)

    return app
