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

githelpers.py: Git Helper

"""

import time
import yaml

from git import Repo

from spectrometer.dashboard import app


class GitHandler:
    def __init__(self, moduel_name):
        self.repo = self.get_modules_repo(moduel_name)

    def get_modules_repo(self, moduel_name):
        """
            finds a modules repository address from repositories.json file
            and returns a Repo object for the repository
            @:param module's name
            @:return repository object for the module
        """
        bare = True
        # todo: remove test and bare
        if moduel_name == 'test':
            bare = False
        with open(app.config['REPOSITORY_ADDRESSES']) as file:
            repositories = yaml.load(file)
        repo_address = repositories[moduel_name]['repo']
        return Repo.init(repo_address, bare=bare)

    def get_commits_stat(self):
        # todo: removing merging commits (more than 1 parent)
        stats = {'commits': []}
        for commit in self.repo.head.commit.iter_parents():
            commit_dic = {
                'hash': commit.hexsha,
                'lines': commit.stats.total,
                # UTC time
                'time': time.strftime("%d %b %Y %H:%M",
                                      time.gmtime(commit.committed_date)),
                'commiter': commit.author.name,
                'email': commit.author.email
            }
            stats['commits'].append(commit_dic)
        return stats
