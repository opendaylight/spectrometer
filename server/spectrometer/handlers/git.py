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

from operator import itemgetter

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
                    name = c['author']
        return name, loc, commit_count

    def authors(self, branch):
        """Returns a list of authors that contributed to a branch.

        Keyword arguments:
        branch -- Branch of repo to pull data from.
        """
        authors = set()
        commits = self.commits(branch)
        for c in commits:
            authors.add((c['author'], c['email']))
        return sorted(authors, key=itemgetter(0))

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
