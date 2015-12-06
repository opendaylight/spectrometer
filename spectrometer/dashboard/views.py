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

from flask import jsonify

from spectrometer.githelpers import GitHandler

# todo: http://flask.pocoo.org/snippets/83/


def hello_world():
    return 'Hello World!'


def git_stat(module_name):
    git_handle = GitHandler(module_name)
    stats = git_handle.get_commits_stat()
    # return Response(response=json.dumps(stats,indent=2,
    #  separators=(',', ': ')), status=200, mimetype='application/json')
    return jsonify(stats)


def gerrit_stat(moduel_name):
    return "Not implemented"