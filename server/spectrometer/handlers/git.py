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

from __future__ import absolute_import

import itertools
import time

from operator import itemgetter

from git import Repo


class GitHandler:
    def __init__(self, project, repo_address):
        self.name = project
        self.repo = Repo(repo_address)

    def format_commit_info(self, commit):
        return {
                'hash': commit.hexsha,
                'lines': commit.stats.total,
                # UTC time
                'time': time.strftime("%d %b %Y %H:%M",
                                      time.gmtime(commit.committed_date)),
                'committer': commit.author.name,
                'email': commit.author.email
            }

    def commits(self, branch):
        """Returns a list of commit data from a repository.

        Keyword arguments:
        branch -- Branch of repo to pull data from.
        """
        # todo: removing merging commits (more than 1 parent)
        stat = []
        last_commit = None
        for b in self.repo.branches:
            if b.name == branch:
                last_commit = b.commit
                break
        if last_commit:
            is_master = branch == 'master'
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

    def branches(self):
        """Returns a list of branches in the repo."""
        branches = [b.name for b in self.repo.branches]
        return branches

    def author_loc(self, email, branch):
        """Returns the commit statistics for an author.

        Stats include:
        - lines of code
        - number of commits

        Keyword arguments:
        branch -- Branch of repo to pull data from.
        email -- Author's email address to get stats against.
        """
        loc = 0
        commit_count = 0
        name = None
        commits = self.commits(branch)
        for c in commits:
            if c['email'] == email:
                loc += c['lines']['lines']
                commit_count += 1
                if not name:
                    name = c['committer']
        return name, loc, commit_count

    def authors(self, branch):
        """Returns a list of authors that contributed to a branch.

        Keyword arguments:
        branch -- Branch of repo to pull data from.
        """
        authors = set()
        commits = self.commits(branch)
        for c in commits:
            authors.add((c['committer'], c['email']))
        return sorted(authors, key=itemgetter(0))
