#!/usr/bin/python
# -*- coding: utf-8 -*-

# @License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
##############################################################################
# Copyright (c) 2016 The Linux Foundation and others.
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
##############################################################################

from flask import Blueprint
from flask import current_app as app
from flask import jsonify

from spectrometer.handlers.gerrit import GerritHandler


gerritapi = Blueprint('gerrit', __name__)


@gerritapi.route('/projects')
def projects():
    """Returns a list of projects by querying Gerrit.

    GET /gerrit/projects

    {
      "projects": [
        "groupbasedpolicy",
        "spectrometer",
        "releng/autorelease",
        "snmp4sdn",
        "ovsdb",
        "nemo",
        ...
        ]
    }
    """
    gerrit = GerritHandler(app.config['GERRIT_URL'])
    return jsonify({'projects': gerrit.projects_list()})
