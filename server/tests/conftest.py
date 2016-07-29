#!/usr/bin/python
# -*- coding: utf-8 -*-

# @License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
##############################################################################
# Copyright (c) 2015, 2016 The Linux Foundation and others.
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
##############################################################################

import os

import pytest
from git import Repo

from spectrometer import create_app


@pytest.fixture
def app(tmpdir):
    with open(os.path.join(str(tmpdir), 'config.py'), 'w+') as f:
        contents = """# Config for testing
LISTEN_HOST = '127.0.0.1'
LISTEN_PORT = 5000
MONGO_HOST = '127.0.0.1'
MONGO_PORT = 27017

GERRIT_URL = 'https://git.opendaylight.org/gerrit/'
MIRROR_DIR = '{tmpdir}/git'
""".format(tmpdir=str(tmpdir))
        f.write(contents)

    with open(os.path.join(str(tmpdir), 'repositories.yaml'), 'w+') as f:
        contents = """# Repositories for testing
spectrometer:
  repo: {tmpdir}/git

""".format(tmpdir=str(tmpdir))
        f.write(contents)

    # Clone a repo for testing
    clone_from = os.path.join(os.getcwd(), '..')
    clone_to = os.path.join(str(tmpdir), 'git', 'spectrometer.git')
    repo = Repo.clone_from(clone_from, clone_to)
    # Need to checkout a branch for the unit tests to work
    branch = repo.create_head('master', 'HEAD')
    repo.head.reference = branch

    config = os.path.join(str(tmpdir), 'config.py')
    app = create_app(config)
    return app
