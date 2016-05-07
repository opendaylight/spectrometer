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


def test_commits(client):
    """Test the git.commits api"""
    resp = client.get(url_for('git.commits', project='spectrometer', no_cache='true'))
    data = json.loads(resp.get_data(as_text=True))
    assert data['commits']

    # Validate the the first commit has the expected spectrometer commit hash
    commits = data['commits']
    assert (commits[-1].get('hash') == '8b053408ae61ce7cb67372146edd7ed5a0fd6838')

    # Test Committer data. Using the 2nd commit pushed into spectrometer repo
    # as the test data.
    commits = data['commits']
    assert (commits[-2].get('author') == 'Thanh Ha')
    assert (commits[-2].get('author_email') == 'thanh.ha@linuxfoundation.org')
    assert (commits[-2].get('hash') == 'f3d7296885386ca68b074c0fe21b42c8d799f818')
