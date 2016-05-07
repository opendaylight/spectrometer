#!/usr/bin/python
# -*- coding: utf-8 -*-

# @License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
##############################################################################
# Copyright (c) 2016 The Linux Foundation and others.
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
##############################################################################

import json

from flask import url_for


def test_branches(client):
    """Test the git.branches api"""
    resp = client.get(url_for('git.branches', project='spectrometer', no_cache='true'))
    data = json.loads(resp.get_data(as_text=True))
    assert data['branches']

    # Validate that the master branch was returned
    branches = data['branches']
    assert ('master' in branches)


def test_commits(client):
    """Test the git.commits api"""
    resp = client.get(url_for('git.commits', project='spectrometer', no_cache='true'))
    data = json.loads(resp.get_data(as_text=True))
    assert data['commits']

    # Validate the first commit has the expected spectrometer commit hash
    commits = data['commits']
    assert (commits[-1].get('hash') == '8b053408ae61ce7cb67372146edd7ed5a0fd6838')

    # Test commit data. Using the 2nd commit pushed into spectrometer repo
    # as the test data.
    commits = data['commits']
    assert (commits[-2].get('author') == 'Thanh Ha')
    assert (commits[-2].get('author_email') == 'thanh.ha@linuxfoundation.org')
    assert (commits[-2].get('author_tz_offset') == 18000)
    assert (commits[-2].get('authored_date') == 1448849259)
    assert (commits[-2].get('committer') == 'Thanh Ha')
    assert (commits[-2].get('committer_email') == 'thanh.ha@linuxfoundation.org')
    assert (commits[-2].get('committer_tz_offset') == 18000)
    assert (commits[-2].get('committed_date') == 1448849300)
    assert (commits[-2].get('hash') == 'f3d7296885386ca68b074c0fe21b42c8d799f818')
    lines = commits[-2].get('lines')
    assert (lines.get('deletions') == 0)
    assert (lines.get('files') == 1)
    assert (lines.get('insertions') == 5)
    assert (lines.get('lines') == 5)
    assert (commits[-2].get('message').startswith('Add .gitreview'))


def test_commits_since_ref(client):
    """Test the git.commits api"""
    resp = client.get(url_for(
        'git.commits_since_ref',
        project='spectrometer',
        ref1='09e539aa4542df7839b2602e0ebe8ff1ba43c6d8',
        ref2='364d571daa352de261dce8d9feb599419b08c913',
        no_cache='true'))
    data = json.loads(resp.get_data(as_text=True))
    assert data['commits']

    # Validate the first commit is ref1
    commits = data['commits']
    assert (commits[0].get('hash') == '09e539aa4542df7839b2602e0ebe8ff1ba43c6d8')

    # Validate the last commit does not include ref2 hash and instead contains the
    # commit after that.
    commits = data['commits']
    assert (commits[-1].get('hash') == 'c1a8458e66347ffd6e334fc26db9c52ab68afe85')
