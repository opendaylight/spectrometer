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
import itertools

from flask import current_app as app

from git import Repo


class GitHandler:
    def __init__(self, moduel_name):
        self.repo = self.get_modules_repo(moduel_name)

    def format_commit_info(self, commit):
        return {
                'hash': commit.hexsha,
                'lines': commit.stats.total,
                # UTC time
                'time': time.strftime("%d %b %Y %H:%M",
                                      time.gmtime(commit.committed_date)),
                'commiter': commit.author.name,
                'email': commit.author.email
            }

    def get_modules_repo(self, moduel_name):
        """
            finds a modules repository address from repositories.json file
            and returns a Repo object for the repository
            @:param module's name
            @:return repository object for the module
        """
        with open(app.config['REPOSITORY_ADDRESSES']) as file:
            repositories = yaml.load(file)
        repo_address = repositories[moduel_name]['repo']
        return Repo(repo_address)

    def get_commits_stat(self, branch_name):
        # todo: removing merging commits (more than 1 parent)
        stat = []
        last_commit = None
        for branch in self.repo.branches:
            if branch.name == branch_name:
                last_commit = branch.commit
                break
        if last_commit:
            commits_in_master = list(self.repo.iter_commits('master'))
            for commit in itertools.chain([last_commit], last_commit.iter_parents()):
                if branch_name != 'master' \
                        and commit in commits_in_master:
                    break
                commit_dic = self.format_commit_info(commit)
                stat.append(commit_dic)
        else:
            # branch was not found
            stat = -1
        return stat

    def get_branches_names(self):
        branches = [b.name for b in self.repo.branches]
        return branches
