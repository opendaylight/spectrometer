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
import itertools

from operator import itemgetter

from git import Repo


class GitHandler:
    def __init__(self, moduel_name, repo_address):
        self.name = moduel_name
        self.repo = Repo(repo_address)

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

    def get_commits_stat(self, branch_name):
        # todo: removing merging commits (more than 1 parent)
        stat = []
        last_commit = None
        for branch in self.repo.branches:
            if branch.name == branch_name:
                last_commit = branch.commit
                break
        if last_commit:
            is_master = branch_name == 'master'
            if not is_master:
                commits_in_master = list(self.repo.iter_commits('master'))
            for commit in itertools.chain([last_commit], last_commit.iter_parents()):
                if not is_master and commit in commits_in_master:
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

    def get_loc_stat(self, email, branch_name):
        loc = 0
        commit_count = 0
        name = None
        commits = self.get_commits_stat(branch_name)
        for c in commits:
            if c['email'] == email:
                loc += c['lines']['lines']
                commit_count += 1
                if not name:
                    name = c['commiter']
        return name, loc, commit_count

    def get_commiters(self, branch_name):
        '''
        :param branch_name:
        :return: sorted list of (email, name) pairs of contributers
        '''
        authors = set()
        commits = self.get_commits_stat(branch_name)
        for c in commits:
            authors.add((c['commiter'], c['email']))
        return sorted(authors, key=itemgetter(0))
