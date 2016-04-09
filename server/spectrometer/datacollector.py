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

from spectrometer.githelpers import GitHandler
from pymongo import MongoClient
import time
import yaml


client = MongoClient('localhost', 27017)
db = client.spectrometer
collection = db.commits


def list_modules(repositories_yaml):
    # todo: move this method and get_modules_repo in githelper to a yaml handler class
    with open(repositories_yaml) as file:
        repositories = yaml.load(file)
    return repositories.keys()


def collect_n_store(repositories_yaml):
    # http://api.mongodb.org/python/current/faq.html#using-pymongo-with-multiprocessing
    client = MongoClient('localhost', 27017)
    db = client.spectrometer
    collection = db.commits

    with open(repositories_yaml) as file:
        repositories = yaml.load(file)
    modules = list_modules(repositories_yaml)

    git_handlers = [GitHandler(module_name, repositories[module_name]['repo'])
                    for module_name in modules]
    while True:
        try:
            for handle in git_handlers:
                branches = handle.get_branches_names()
                for branch_name in branches:
                    stat = handle.get_commits_stat(branch_name)
                    for commit in stat:
                        commit['_id'] = commit['hash']
                        del commit['hash']
                        commit['branch'] = branch_name
                        commit['module'] = handle.name
                        collection.replace_one(
                            {'_id': commit['_id']},
                            commit,
                            upsert=True
                        )
            time.sleep(600)
        except KeyboardInterrupt:
            pass


def get_commits_stat_db(module, branch_name):
    pipeline = [{'$match': {'branch': branch_name, 'module': module}},
                {'$project': {'_id': 0,
                              'commiter': 1,
                              'email': 1,
                              'hash': '$_id',
                              'lines': 1,
                              'time': 1
                              }}
                ]
    return list(collection.aggregate(pipeline))
