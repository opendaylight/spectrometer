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


@gitapi.route('/author/loc/<email>/<project>')
@gitapi.route('/author/loc/<email>/<project>/<path:branch>')
def author_loc(email, project, branch='master'):
    """Returns the total commit and lines of code contributed by an author

    GET /git/author/loc/:email/:project/
    GET /git/author/loc/:email/:project/:branch

    {
      "commit_count": 28,
      "loc": 1304,
      "name": "Thanh Ha"
    }
    """
    git = create_handler(project)
    stat = git.author_loc(email, branch)
    return jsonify({'name': stat[0],
                    'loc': stat[1],
                    'commit_count': stat[2]}
                   )


@gitapi.route('/authors/<project>')
@gitapi.route('/authors/<project>/<path:branch>')
def authors(project, branch='master'):
    """Returns a list of authors in a given repository.

    GET /git/authors/:project
    GET /git/authors/:project/:branch

    {
      "authors": [
        [
          "Ryan Goulding",
          "...@gmail.com"
        ],
        [
          "Sai MarapaReddy",
          "...@brocade.com"
        ]
      ]
    }
    """
    git = create_handler(project)
    authors = git.authors(branch)
    return jsonify({'authors': authors})


@gitapi.route('/branches/<project>')
def branches(project):
    """Returns a list of branches in a given repository.

    GET /git/branches/:project

    {
      "branches": [
        "master",
        "stable/beryllium",
        "stable/helium",
        "stable/lithium"
      ]
    }
    """
    git = create_handler(project)
    branches = git.branches()
    return jsonify({'branches': branches})


@gitapi.route('/commits/<project>')
@gitapi.route('/commits/<project>/<path:branch>')
def commits(project, branch='master'):
    """Returns a list of commit messages in a repository.

    GET /git/commits/:project?db=true

    List of commits in *master* branch.

    GET /git/commits/:project/:branch?db=true

    List of commits in *branchname* and their ancestors excluding those in
    *master* branch.

    If arg *db* is passed, query will be done over database, rather than Git
    repository.

    {
      "commits": [
        {
          "committer": "Ryan Goulding",
          "email": "@gmail.com",
          "hash": "f6c87f3cd7eaa6ffc32625546828a2b6cd42722e",
          "lines": {
            "deletions": 0,
            "files": 4,
            "insertions": 275,
            "lines": 275
          },
          "time": "05 Feb 2016 23:27"
        },
        ...
        ]
    }
    """
    git = create_handler(project)

    if request.args.get('db', False):
        commits = commits_stat_db(project, branch)
    else:
        commits = git.commits(branch)

    if commits == -1:
        result = {'error': 'Branch {0} was not found!'.format(branch)}
    else:
        result = {'commits': commits}
    # return Response(response=json.dumps(stats,indent=2,
    #  separators=(',', ': ')), status=200, mimetype='application/json')
    return jsonify(result)
