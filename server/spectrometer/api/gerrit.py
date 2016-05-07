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
from flask import request

from spectrometer.handlers.gerrit import GerritHandler
from spectrometer.utils import check_parameters

gerritapi = Blueprint('gerrit', __name__)


@gerritapi.route('/branches')
def branches():
    """Returns a list of branches in a given repository by querying Gerrit.

    GET /gerrit/branches?param=<value>

    :arg str project: Project to query branches from. (required)

    JSON::

        {
          "branches": [
            {
              "ref": "refs/heads/stable/beryllium",
              "revision": "8f72284f3808328604bdff7f91a6999094f7c6d7"
            },
            ...
            ]
        }
    """
    mapping = {
        'project': request.args.get('project', None),
    }
    result = check_parameters(mapping)
    if not result:
        gerrit = GerritHandler(app.config['GERRIT_URL'])
        branches = gerrit.project_branches_list(mapping['project'])
        if not branches:
            result = {'error': 'No branches found for {0}.'.format(mapping['project'])}
        else:
            result = {'branches': branches}
    return jsonify(result)


@gerritapi.route('/merged_changes')
def merged_changes():
    """Returns a list of merged changes in a given repository by querying Gerrit.

    GET /gerrit/changes?param=<value>

    :arg str project: Project to query changes from. (required)
    :arg str branch: Branch to pull changes from. (default: master)

    JSON::

        {
          "changes": [
            {
              "_number": 37706,
              "branch": "master",
              "change_id": "I4168e023b77bfddbb6f72057e849925ba2dffa17",
              "created": "2016-04-18 02:42:33.000000000",
              "deletions": 0,
              "hashtags": [],
              "id": "spectrometer~master~I4168e023b77bfddbb6f72057e849925ba2dffa17",
              "insertions": 119,
              "owner": {
                "_account_id": 2759
              },
              "project": "spectrometer",
              "status": "MERGED",
              "subject": "Add API to return commits since ref",
              "submittable": false,
              "topic": "git-api",
              "updated": "2016-04-19 09:03:03.000000000"
            },
            ...
            ]
        }
    """
    mapping = {
        'project': request.args.get('project', None),
        'branch': request.args.get('branch', 'master')
    }
    result = check_parameters(mapping)
    if not result:
        gerrit = GerritHandler(app.config['GERRIT_URL'])
        changes = gerrit.project_merged_changes_list(mapping['project'], mapping['branch'])
        if not changes:
            result = {'error': 'No changes found for {0}.'.format(mapping['project'])}
        else:
            result = {'changes': changes}
    return jsonify(result)


@gerritapi.route('/projects')
def projects():
    """Returns a list of projects by querying Gerrit.

    GET /gerrit/projects

    JSON::

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


@gerritapi.route('/tags')
def tags():
    """Returns a list of tags in a given repository by querying Gerrit.

    GET /gerrit/tags?param=<value>

    :arg str project: Project to query tags from. (required)

    JSON::

        {
          "tags": [
            {
              "message": "OpenDaylight Beryllium-SR1 release",
              "object": "f76cc0a12dc8f06dae3cedc31d06add72df8de5d",
              "ref": "refs/tags/release/beryllium-sr1",
              "revision": "8b92d614ee48b4fc5ba11c3f38c92dfa14d43655",
              "tagger": {
                "date": "2016-03-23 13:34:09.000000000",
                "email": "thanh.ha@linuxfoundation.org",
                "name": "Thanh Ha",
                "tz": -240
              }
            },
            ...
            ]
        }
    """
    mapping = {
        'project': request.args.get('project', None),
    }
    result = check_parameters(mapping)
    if not result:
        gerrit = GerritHandler(app.config['GERRIT_URL'])
        tags = gerrit.project_tags_list(mapping['project'])
        if not branches:
            result = {'error': 'No tags found for {0}.'.format(mapping['project'])}
        else:
            result = {'tags': tags}
    return jsonify(result)
