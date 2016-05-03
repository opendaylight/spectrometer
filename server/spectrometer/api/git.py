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

import yaml

from flask import Blueprint
from flask import current_app as app
from flask import jsonify
from flask import request

from spectrometer.datacollector import commits_stat_db
from spectrometer.handlers.git import GitHandler
from spectrometer.utils import check_parameters

gitapi = Blueprint('git', __name__)


def get_repo_address(project):
    """Retrieves the repo_url for a project."""
    with open(app.config['REPOSITORY_ADDRESSES']) as file:
        repositories = yaml.load(file)
    repo_address = repositories[project]['repo']
    return repo_address


def create_handler(project):
    """Convenience function for creating GitHandlers"""
    return GitHandler(project, get_repo_address(project))


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
        git = create_handler(mapping['project'])
        branches = git.branches()

        if not branches:
            result = {'error': 'No branches found for {0}.'.format(
                mapping['project'])}
        else:
            result = {'branches': branches}

    return jsonify(result)


@gitapi.route('/commits')
def commits():
    """Returns a list of commit messages in a repository.

    GET /git/commits?param=<value>

    :arg str project: Project to query commits from. (required)
    :arg str branch: Branch to pull commits from. (default: master)
    :arg bool db: To pull cached data or not. (default: false)

    JSON::

        {
          "commits": [
            {
              "author": "Thanh Ha",
              "email": "thanh.ha@linuxfoundation.org",
              "hash": "1e409af62fd99413c5be86c5b43ad602a8cebc1e",
              "lines": {
                "deletions": 55,
                "files": 7,
                "insertions": 103,
                "lines": 158
              },
              "time": "10 Apr 2016 15:26"
            },
            ...
          ]
        }
    """
    mapping = {
        'project': request.args.get('project', None),
        'branch': request.args.get('branch', 'master'),
        'no_cache': request.args.get('no_cache', False),
    }

    result = check_parameters(mapping)
    if not result:
        git = create_handler(mapping['project'])

        if mapping['no_cache']:
            commits = git.commits(mapping['branch'])
        else:
            commits = commits_stat_db(mapping['project'], mapping['branch'])

        if not commits:
            result = {'error': 'Unable to lookup commits, branch {0} was not found!'.format(mapping['branch'])}
        else:
            result = {'commits': commits}

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
              "email": "thanh.ha@linuxfoundation.org",
              "hash": "1e409af62fd99413c5be86c5b43ad602a8cebc1e",
              "lines": {
                "deletions": 55,
                "files": 7,
                "insertions": 103,
                "lines": 158
              },
              "time": "10 Apr 2016 15:26"
            },
            ...
          ]
        }
    """
    mapping = {
        'project': request.args.get('project', None),
        'branch': request.args.get('branch', None),
        'ref': request.args.get('ref', None),
    }

    result = check_parameters(mapping)
    if not result:
        git = create_handler(mapping['project'])
        commits = git.commits_since_ref(mapping['branch'], mapping['ref'])

        if not commits:
            result = {'error': 'Unable to compare {branch} to {ref}.'.format(
                branch=mapping['branch'], ref=mapping['ref'])}
        else:
            result = {'commits': commits}

    return jsonify(result)
