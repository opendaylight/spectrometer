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

import time

from pymongo import MongoClient
import yaml

from flask import current_app as app

from spectrometer.handlers.git import GitHandler


def collect_n_store(repositories_yaml, mongo_host='127.0.0.1', mongo_port=27017):
    # http://api.mongodb.org/python/current/faq.html#using-pymongo-with-multiprocessing
    client = MongoClient(mongo_host, mongo_port)
    db = client.spectrometer
    collection = db.commits

    with open(repositories_yaml) as file:
        repositories = yaml.load(file)
    modules = repositories.keys()

    git_handlers = [GitHandler(module_name, repositories[module_name]['repo'])
                    for module_name in modules]
    while True:
        try:
            for handle in git_handlers:
                for branch in handle.branches():
                    for commit in handle.commits(branch):
                        commit['_id'] = commit['hash']
                        del commit['hash']
                        commit['branch'] = branch
                        commit['module'] = handle.name
                        collection.replace_one(
                            {'_id': commit['_id']},
                            commit,
                            upsert=True
                        )
            time.sleep(600)
        except KeyboardInterrupt:
            pass


def get_commits_stat_db(module, branch):
    collection = app.mongo.db.commits
    pipeline = [{'$match': {'branch': branch, 'module': module}},
                {'$project': {'_id': 0,
                              'committer': 1,
                              'email': 1,
                              'hash': '$_id',
                              'lines': 1,
                              'time': 1
                              }}
                ]
    return list(collection.aggregate(pipeline))
