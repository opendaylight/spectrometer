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

import yaml

from flask import jsonify
from flask import request
from flask import current_app as app

from spectrometer.githelpers import GitHandler
from spectrometer.gerrithelper import GerritHandler
from spectrometer.datacollector import get_commits_stat_db

# todo: http://flask.pocoo.org/snippets/83/


def get_repo_address(module_name):
    with open(app.config['REPOSITORY_ADDRESSES']) as file:
        repositories = yaml.load(file)
    repo_address = repositories[module_name]['repo']
    return repo_address


def create_handler(module_name):
    return GitHandler(module_name,
                      get_repo_address(module_name)
                      )


def hello_world():
    return 'Hello World!'


def git_stat(module_name, branch_name='master'):
    """Returns a list of commit messages in a repository

    GET /git/commits/:modulename?db=true

    List of commits in *master* branch.

    GET /git/commits/:modulename/:branchname?db=true

    List of commits in *branchname* and their ancestors excluding those in
    *master* branch.

    If arg *db* is passed, query will be done over database, rather than Git
    repository.

    {
      "commits": [
        {
          "commiter": "Ryan Goulding",
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
    if request.args.get('db', False):
        stat = get_commits_stat_db(module_name, branch_name)
    else:
        git_handle = create_handler(module_name)
        stat = git_handle.get_commits_stat(branch_name)

    if stat == -1:
        result = {'error': 'Branch {0} was not found!'.format(branch_name)}
    else:
        result = {'commits': stat}
    # return Response(response=json.dumps(stats,indent=2,
    #  separators=(',', ': ')), status=200, mimetype='application/json')
    return jsonify(result)


def list_branches(module_name):
    """Returns a list of branches in a given repository

    GET /git/branches/:modulename

    {
      "names": [
        "master",
        "pre-boron",
        "stable/beryllium",
        "stable/helium",
        "stable/lithium"
      ]
    }
    """
    git_handle = create_handler(module_name)
    branches = git_handle.get_branches_names()
    return jsonify({'names': branches})


def loc_stat(author_email, module_name, branch_name='master'):
    """Returns the total commit and lines of code contributed by an author

    GET /git/author/loc/:author_email/:module_name/
    GET /git/author/loc/:author_email/:module_name/:branch_name

    {
      "commit_count": 28,
      "loc": 1304,
      "name": "Thanh Ha"
    }
    """
    git_handle = create_handler(module_name)
    stat = git_handle.get_loc_stat(author_email, branch_name)
    return jsonify({'name': stat[0],
                    'loc': stat[1],
                    'commit_count': stat[2]}
                   )


def list_authors(module_name, branch_name='master'):
    """Returns a list of authors in a given repository

    GET /git/authors/:module_name
    GET /git/authors/:module_name/:branch_name

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
    git_handle = create_handler(module_name)
    authors = git_handle.get_commiters(branch_name)
    return jsonify({'authors': authors})


def list_projects():
    """Returns a list of projects by querying Gerrit

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


def gerrit_stat(moduel_name):
    return "Not implemented"
