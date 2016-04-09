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

import requests
import json

from six.moves.urllib.parse import urljoin


class Gerrit():
    GERRIT_MAGIC_STRING = ")]}'"

    def __init__(self, base_url):
        self.BASE_URL = base_url

    def projects_list(self):
        url = urljoin(self.BASE_URL, './projects/')
        response = requests.get(url).text
        return json.loads(
            response.lstrip(self.GERRIT_MAGIC_STRING)
        ).keys()
