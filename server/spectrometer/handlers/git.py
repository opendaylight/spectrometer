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
                'author': commit.author.name,
                'author_email': commit.author.email,
                'authored_date': commit.authored_date,  # seconds since epoch
                'author_tz_offset': commit.author_tz_offset,  # seconds west of utc
                'committer': commit.committer.name,
                'committer_email': commit.committer.email,
                'committed_date': commit.committed_date,  # seconds since epoch
                'committer_tz_offset': commit.committer_tz_offset,  # seconds west of utc
                'message': commit.message,
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
        commits = []

        for commit in self.repo.iter_commits(rev=branch):
            commit_dic = self.format_commit_info(commit)
            commits.append(commit_dic)

        return commits

    def commits_since_ref(self, ref1, ref2):
        """Returns a list of commits in branch until common parent of ref

        Searches Git for a common_parent between *branch* and *ref* and returns
        a the commit log of all the commits until the common parent excluding
        the common_parent commit itself.

        Arguments:
            ref1 -- The main reference point to query data from
            ref2 -- Reference point in which to compare ref1 from
        """
        commits = []
        try:
            common_parent = self.repo.merge_base(ref1, ref2)[0]
        except GitCommandError:
            # If we fail to get the merge base simply return empty list as we
            # can no longer proceed any further.
            return commits

        # Order is important here. A..B will show you all commits that B has
        # excluding A. Spectrometer is interested in finding all commits since
        # the common parent of ref1 and ref2
        for commit in self.repo.iter_commits(
            "{parent}..{ref1}".format(
                ref1=ref1,
                parent=common_parent.hexsha)):
            commit_dic = self.format_commit_info(commit)
            commits.append(commit_dic)

        return commits
