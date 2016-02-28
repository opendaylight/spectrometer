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

import spectrometer.views as views


def create_app(config):
    app = Flask(__name__)
    app.config.from_pyfile(config)

    app.route('/')(views.hello_world)
    app.route('/git/commits/<module_name>')(views.git_stat)
    app.route('/git/commits/<module_name>/<path:branch_name>')(views.git_stat)
    app.route('/git/branches/<module_name>')(views.list_branches)
    app.route('/git/author/loc/<author_email>/<module_name>')(views.loc_stat)
    app.route('/git/author/loc/<author_email>/<module_name>/<path:branch_name>')(views.loc_stat)
    app.route('/git/authors/<module_name>')(views.list_authors)
    app.route('/git/authors/<module_name>/<path:branch_name>')(views.list_authors)
    app.route('/gerrit/projects')(views.list_projects)
    app.route('/gerrit/<module_name>')(views.gerrit_stat)

    return app
