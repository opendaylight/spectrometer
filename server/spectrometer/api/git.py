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

import os

from flask import Blueprint
from flask import current_app as app
from flask import jsonify
from flask import request

from spectrometer.handlers.git import GitHandler
from spectrometer.utils import check_parameters
from spectrometer.utils import get_cache

gitapi = Blueprint('git', __name__)


def create_handler(project):
    """Convenience function for creating GitHandlers"""
    mirror_dir = app.config['MIRROR_DIR']
    project_dir = os.path.join(mirror_dir, '{0}.git'.format(project))
    return GitHandler(project, project_dir)


@gitapi.route('/branches')
def branches():
    """Returns a list of branches in a given repository.

    GET /git/branches?param=<value>

    :arg str project: Project to query commits from. (required)

    JSON::

        {
          "branches": [
            "master",
            "stable/beryllium",
            "stable/helium",
            "stable/lithium",
            ...
          ]
        }
    """

    mapping = {
        'project': request.args.get('project', None),
        'no_cache': request.args.get('no_cache', False),
    }

    result = check_parameters(mapping)
    if not result:
        git = create_handler(mapping['project'])
        collection = app.mongo.db.branches
        data_id = '{0}'.format(mapping['project'])

        args = []
        branches = get_cache(collection, data_id, mapping['no_cache'], git.branches, args)

        if branches:
            result = {'branches': branches}
        else:
            result = {'error': 'No branches found for {0}.'.format(mapping['project'])}

    return jsonify(result)


@gitapi.route('/commits')
def commits():
    """Returns a list of commit messages in a repository.

    GET /git/commits?param=<value>

    :arg str project: Project to query commits from. (required)
    :arg str branch: Branch to pull commits from. (default: master)
    :arg bool no_cache: To skip cached data or not. (default: false)

    JSON::

        {
          "commits": [
            {
              "author": "Thanh Ha",
              "author_email": "thanh.ha@linuxfoundation.org",
              "author_tz_offset": 14400,
              "authored_date": 1460316386,
              "committed_date": 1460392605,
              "committer": "Thanh Ha",
              "committer_email": "thanh.ha@linuxfoundation.org",
              "committer_tz_offset": 14400,
              "hash": "1e409af62fd99413c5be86c5b43ad602a8cebc1e",
              "lines": {
                "deletions": 55,
                "files": 7,
                "insertions": 103,
                "lines": 158
              },
              "message": "Refactor Gerrit API into a Flask Blueprint..."
            },
            ...
          ]
        }

    .. note::

        :date: The date represented in seconds since epoch
        :tz_offset: The seconds offset west of UTC.
    """
    mapping = {
        'project': request.args.get('project', None),
        'branch': request.args.get('branch', 'master'),
        'no_cache': request.args.get('no_cache', False),
    }

    result = check_parameters(mapping)
    if not result:
        git = create_handler(mapping['project'])
        collection = app.mongo.db.commits
        data_id = '{0}:{1}'.format(mapping['project'], mapping['branch'])

        args = [mapping['branch']]
        commits = get_cache(collection, data_id, mapping['no_cache'], git.commits, args)

        if commits:
            result = {'commits': commits}
        else:
            result = {'error': 'Unable to lookup commits, branch {0} was not found!'.format(mapping['branch'])}

    return jsonify(result)


@gitapi.route('/commits_since_ref')
def commits_since_ref():
    """Returns a list of commits in branch until common parent of ref.

    Searches Git for a common_parent between *branch* and *ref* and returns
    a the commit log of all the commits until the common parent excluding
    the common_parent commit itself.

    GET /git/commits_since_ref?param=<value>

    :arg str project: Project to query commits from. (required)
    :arg str branch: Branch to pull commits from. (required)
    :arg str ref: To pull cached data or not. (required)

    JSON::

        {
          "commits": [
            {
              "author": "Thanh Ha",
              "author_email": "thanh.ha@linuxfoundation.org",
              "author_tz_offset": 14400,
              "authored_date": 1460316386,
              "committed_date": 1460392605,
              "committer": "Thanh Ha",
              "committer_email": "thanh.ha@linuxfoundation.org",
              "committer_tz_offset": 14400,
              "hash": "1e409af62fd99413c5be86c5b43ad602a8cebc1e",
              "lines": {
                "deletions": 55,
                "files": 7,
                "insertions": 103,
                "lines": 158
              },
              "message": "Refactor Gerrit API into a Flask Blueprint..."
            },
            ...
          ]
        }
    """
    mapping = {
        'project': request.args.get('project', None),
        'ref1': request.args.get('ref1', None),
        'ref2': request.args.get('ref2', None),
        'no_cache': request.args.get('no_cache', False),
    }

    result = check_parameters(mapping)
    if not result:
        git = create_handler(mapping['project'])
        collection = app.mongo.db.commits
        data_id = '{0}:{1}:{2}'.format(mapping['project'], mapping['ref1'], mapping['ref2'])

        args = [mapping['ref1'], mapping['ref2']]
        commits = get_cache(collection, data_id, mapping['no_cache'], git.commits_since_ref, args)

        if commits:
            result = {'commits': commits}
        else:
            result = {'error': 'Unable to compare {ref1} to {ref2}.'.format(
                ref1=mapping['ref1'], ref2=mapping['ref2'])}

    return jsonify(result)
