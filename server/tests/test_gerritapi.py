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
import responses


@responses.activate
def test_branches(client):
    responses.add(responses.GET, 'https://git.opendaylight.org/gerrit/projects/controller/branches/',
                  body="""[
  {
    "ref": "HEAD",
    "revision": "master"
  },
  {
    "ref": "refs/heads/master",
    "revision": "a1f54a11f6c8675404efc1afcca3e0bd5f9a7e36"
  },
  {
    "can_delete": true,
    "ref": "refs/heads/stable/beryllium",
    "revision": "8f72284f3808328604bdff7f91a6999094f7c6d7"
  },
  {
    "can_delete": true,
    "ref": "refs/heads/stable/helium",
    "revision": "bb015d89626655f557f03fdfe4e4b40ff46a064c"
  },
  {
    "can_delete": true,
    "ref": "refs/heads/stable/hydrogen",
    "revision": "058ba87644c6cb46773bbe5046367b3f3b0ed4e6"
  },
  {
    "can_delete": true,
    "ref": "refs/heads/stable/lithium",
    "revision": "e184265e3fc9bb0dd57c4229dc67530f13659ddb"
  }
  ]""", status=200, content_type='application/json')
    resp = client.get(url_for('gerrit.branches', project='controller'))
    data = json.loads(resp.get_data(as_text=True))
    branches = data['branches']

    # Validate the first branch
    assert branches[0].get('ref') == 'HEAD'
    assert branches[0].get('revision') == 'master'

    # Validate the last branch
    assert branches[-1].get('ref') == 'refs/heads/stable/lithium'
    assert branches[-1].get('revision') == 'e184265e3fc9bb0dd57c4229dc67530f13659ddb'
    assert branches[-1].get('can_delete')


@responses.activate
def test_projects(client):
    responses.add(responses.GET, 'https://git.opendaylight.org/gerrit/projects/',
                  body="""{
  "controller": {
    "id": "controller",
    "state": "ACTIVE"
  },
  "odlparent": {
    "id": "odlparent",
    "state": "ACTIVE"
  },
  "yangtools": {
    "id": "yangtools",
    "state": "ACTIVE"
  }}""", status=200, content_type='application/json')
    resp = client.get(url_for('gerrit.projects'))
    data = json.loads(resp.get_data(as_text=True))
    expected_list = ['controller', 'odlparent', 'yangtools']
    assert set(data['projects']) == set(expected_list)


@responses.activate
def test_tags(client):
    responses.add(responses.GET, 'https://git.opendaylight.org/gerrit/projects/controller/tags/',
                  body="""[
  {
    "object": "79788bdd3a9319e5dd625a374438e5e2ef02480f",
    "message": "OpenDaylight Beryllium release",
    "tagger": {
      "name": "Thanh Ha",
      "email": "thanh.ha@linuxfoundation.org",
      "date": "2016-02-18 21:31:59.000000000",
      "tz": -300
    },
    "ref": "refs/tags/release/beryllium",
    "revision": "d7f20530e3923d1767d9dfcae7dbb4f8f64ed6df"
  },
  {
    "object": "f76cc0a12dc8f06dae3cedc31d06add72df8de5d",
    "message": "OpenDaylight Beryllium-SR1 release",
    "tagger": {
      "name": "Thanh Ha",
      "email": "thanh.ha@linuxfoundation.org",
      "date": "2016-03-23 13:34:09.000000000",
      "tz": -240
    },
    "ref": "refs/tags/release/beryllium-sr1",
    "revision": "8b92d614ee48b4fc5ba11c3f38c92dfa14d43655"
  }
  ]""", status=200, content_type='application/json')
    resp = client.get(url_for('gerrit.tags', project='controller'))
    data = json.loads(resp.get_data(as_text=True))
    tags = data['tags']
    print(tags[0])

    # Validate Beryllium release tag
    assert tags[0].get('object') == '79788bdd3a9319e5dd625a374438e5e2ef02480f'
    assert tags[0].get('message') == 'OpenDaylight Beryllium release'
    assert tags[0].get('ref') == 'refs/tags/release/beryllium'
    assert tags[0].get('revision') == 'd7f20530e3923d1767d9dfcae7dbb4f8f64ed6df'
    tagger = tags[0].get('tagger')
    assert tagger.get('name') == 'Thanh Ha'
    assert tagger.get('email') == 'thanh.ha@linuxfoundation.org'
    assert tagger.get('date') == '2016-02-18 21:31:59.000000000'
    assert tagger.get('tz') == -300

    # Validate Beryllium-SR1 tag is also available
    assert tags[1].get('object') == 'f76cc0a12dc8f06dae3cedc31d06add72df8de5d'
