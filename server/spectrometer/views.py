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

views.py: Web App

"""

import yaml

from flask import jsonify
from flask import request
from flask import current_app as app

from spectrometer.githelpers import GitHandler
from spectrometer.gerrithelper import Gerrit
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
    git_handle = create_handler(module_name)
    branches = git_handle.get_branches_names()
    return jsonify({'names': branches})


def loc_stat(author_email, module_name, branch_name='master'):
    git_handle = create_handler(module_name)
    stat = git_handle.get_loc_stat(author_email, branch_name)
    return jsonify({'name': stat[0],
                    'loc': stat[1],
                    'commit_count': stat[2]}
                   )


def list_authors(module_name, branch_name='master'):
    git_handle = create_handler(module_name)
    authors = git_handle.get_commiters(branch_name)
    return jsonify({'authors': authors})


def list_projects():
    gerrit = Gerrit(app.config['BASE_GERRIT_URL'])
    return jsonify({'projects': gerrit.projects_list()})


def gerrit_stat(moduel_name):
    return "Not implemented"
