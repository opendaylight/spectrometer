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

from git import Repo
from git.exc import GitCommandError


class GitHandler:
    def __init__(self, project, repo_address):
        self.name = project
        self.repo = Repo(repo_address)

    def format_commit_info(self, commit):
        return {
                'hash': commit.hexsha,
                'lines': commit.stats.total,
                # since epoch time in milliseconds
                'time': commit.committed_date * 1000,
                'author': commit.author.name,
                'email': commit.author.email
            }

    def branches(self):
        """Returns a list of branches in the repo."""
        branches = [b.name for b in self.repo.branches]
        return branches

    def commits(self, branch):
        """Returns a list of commit data from a repository.

        Keyword arguments:
        branch -- Branch of repo to pull data from.
        """
        # todo: removing merging commits (more than 1 parent)
        commits = []
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
                commits.append(commit_dic)

        return commits

    def commits_since_ref(self, branch, ref):
        """Returns a list of commits in branch until common parent of ref

        Searches Git for a common_parent between *branch* and *ref* and returns
        a the commit log of all the commits until the common parent excluding
        the common_parent commit itself.

        Arguments:
            branch -- Branch which we want to gather commit logs from
            ref -- Reference point in which to get commits from
        """
        commits = []
        try:
            common_parent = self.repo.merge_base(branch, ref)[0]
        except GitCommandError:
            # If we fail to get the merge base simply return empty list as we
            # can no longer proceed any further.
            return commits

        # Order is important here. A..B will show you all commits that B has
        # excluding A. Spectrometer is interested in finding all commits since
        # the common branch
        for commit in self.repo.iter_commits(
            "{parent}..{branch}".format(
                branch=branch,
                parent=common_parent.hexsha)):
            commit_dic = self.format_commit_info(commit)
            commits.append(commit_dic)

        return commits
