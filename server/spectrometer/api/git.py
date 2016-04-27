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

from spectrometer.handlers.git import GitHandler
from spectrometer.utils import check_parameters
from spectrometer.utils import get_cache

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


@gitapi.route('/author/loc')
def author_loc(email, project, branch='master'):
    """Returns the total commit and lines of code contributed by an author.

    GET /git/author/loc?param=<value>

    :arg str email: Email of author to search. (required)
    :arg str project: Project to query commits from. (required)
    :arg str branch: Branch to pull commits from. (default: master)

    JSON::

        {
          "commit_count": 28,
          "loc": 1304,
          "name": "Thanh Ha"
        }
    """
    mapping = {
        'email': request.args.get('email', None),
        'project': request.args.get('project', None),
        'branch': request.args.get('branch', 'master'),
    }

    result = check_parameters(mapping)
    if not result:
        git = create_handler(mapping['project'])
        author_loc = git.author_loc(mapping['email'], mapping['branch'])

        if not author_loc:
            result = {'error': 'No results found for {0.'.format(
                mapping['email'])}
        else:
            result = {
                'name': author_loc[0],
                'loc': author_loc[1],
                'commit_count': author_loc[2]
            }

    return jsonify(result)


@gitapi.route('/authors')
def authors():
    """Returns a list of authors in a given repository.

    GET /git/authors?param=<value>

    :arg str project: Project to query commits from. (required)
    :arg str branch: Branch to pull commits from. (default: master)

    JSON::

        {
          "authors": [
            [
              "Mohammad Hassan Zahraee",
              "moh_zahraee@yahoo.com"
            ],
            [
              "Thanh Ha",
              "thanh.ha@linuxfoundation.org"
            ],
            ...
          ]
        }
    """
    mapping = {
        'project': request.args.get('project', None),
        'branch': request.args.get('branch', 'master'),
    }

    result = check_parameters(mapping)
    if not result:
        git = create_handler(mapping['project'])
        authors = git.authors(mapping['branch'])

        if not authors:
            result = {'error': 'No authors found for {0} branch {1}.'.format(
                mapping['project'], mapping['branch'])}
        else:
            result = {'authors': authors}

    return jsonify(result)


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
        'no_cache': request.args.get('no_cache', False),
    }

    result = check_parameters(mapping)
    if not result:
        git = create_handler(mapping['project'])
        collection = app.mongo.db.commits
        data_id = '{0}:{1}:{2}'.format(mapping['project'], mapping['branch'], mapping['ref'])

        args = [mapping['branch'], mapping['ref']]
        commits = get_cache(collection, data_id, mapping['no_cache'], git.commits_since_ref, args)

        if commits:
            result = {'commits': commits}
        else:
            result = {'error': 'Unable to compare {branch} to {ref}.'.format(
                branch=mapping['branch'], ref=mapping['ref'])}

    return jsonify(result)
