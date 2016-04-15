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


@gerritapi.route('/project/tags/<string:project>')
def project_tags(project):
    """Returns a list of project tags for a project by querying Gerrit.

    GET /gerrit/projects/{project_id}/tags

    {
      "tags": [
        {
          "ref": "refs/tags/stable/beryllium",
          "revision": "49ce77fdcfd3398dc0dedbe016d1a425fd52d666",
          "object": "1624f5af8ae89148d1a3730df8c290413e3dcf30",
          "message": "Tag Message",
          "tagger": {
            "name": "Name",
            "email": "email@email.com",
            "date": "2000-01-01 01:00:00.000000000"
          }
        },
        ...
        ]
    }
    """
    gerrit = GerritHandler(app.config['GERRIT_URL'])
    return jsonify({'tags': gerrit.project_tags_list(project)})
