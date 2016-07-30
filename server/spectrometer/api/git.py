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
from flask import jsonify
from flask import request

from spectrometer.handlers.git import get_githandler
from spectrometer.utils import check_parameters

gitapi = Blueprint('git', __name__)


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
    }

    result = check_parameters(mapping)
    if not result:
        git = get_githandler(mapping['project'])
        branches = git.branches()

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
    }

    filters = {
        'author': request.args.get('author', None),
        'organization': request.args.get('organization', None)
    }

    result = check_parameters(mapping)
    if not result:
        git = get_githandler(mapping['project'])
        commits = git.commits(mapping['branch'], filters=filters)

        if commits:
            result = {'commits': commits}
        else:
            result = {'error': 'Unable to lookup commits, branch {0} was not found!'.format(mapping['branch'])}

    return jsonify(result)


@gitapi.route('/commits_since_ref')
def commits_since_ref():
    """Returns a list of commits in branch until common parent of ref.

    Searches Git for a common_parent between *ref1* and *ref2* and returns
    a the commit log of all the commits until the common parent excluding
    the common_parent commit itself.

    GET /git/commits_since_ref?param=<value>

    :arg str project: Project to query commits from. (required)
    :arg str ref1: Reference to get commit information from. (required)
    :arg str ref2: Reference to start at until ref1. (required)

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
    }

    filters = {
        'author': request.args.get('author', None),
        'organization': request.args.get('organization', None)
    }

    result = check_parameters(mapping)
    if not result:
        git = get_githandler(mapping['project'])
        commits = git.commits_since_ref(
            mapping['ref1'], mapping['ref2'], filters=filters)

        if commits:
            result = {'commits': commits}
        else:
            result = {'error': 'Unable to compare {ref1} to {ref2}.'.format(
                ref1=mapping['ref1'], ref2=mapping['ref2'])}

    return jsonify(result)


@gitapi.route('/project_info')
def project_info():
    """Provides meta information on project.

    Refer to the specfile located here:
    https://opendaylight-spectrometer.readthedocs.io/en/latest/project-info-spec.html
    """
    mapping = {
        'project': request.args.get('project', None),
    }

    result = check_parameters(mapping)
    if not result:
        git = get_githandler(mapping['project'])
        project_info = git.project_info()
        result = {'project-info': project_info}

    return jsonify(result)
