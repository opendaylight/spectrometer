#!/usr/bin/python
# -*- coding: utf-8 -*-

# @License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
##############################################################################
# Copyright (c) 2015, 2016 Mohammed Hassan Zahraee and others.
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
##############################################################################

import requests
import json

from six.moves.urllib.parse import urljoin


class GerritHandler():
    GERRIT_MAGIC_STRING = ")]}'"

    def __init__(self, base_url):
        self.BASE_URL = base_url

    def project_branches_list(self, project):
        """Returns a list of project branches as reported by Gerrit."""
        url = urljoin(self.BASE_URL, 'projects/{0}/branches/'.format(project))
        response = requests.get(url).text.lstrip(self.GERRIT_MAGIC_STRING)
        project_branches = json.loads(response)
        return project_branches

    def project_merged_changes_list(self, project, branch):
        """Returns a list of project merged changes as reported by Gerrit."""
        url = urljoin(self.BASE_URL, 'changes/?q=status:merged+project:{0}+branch:{1}'.format(project, branch))
        response = requests.get(url).text.lstrip(self.GERRIT_MAGIC_STRING)
        project_changes = json.loads(response)
        return project_changes

    def project_tags_list(self, project):
        """Returns a list of project tags as reported by Gerrit."""
        url = urljoin(self.BASE_URL, 'projects/{0}/tags/'.format(project))
        response = requests.get(url).text.lstrip(self.GERRIT_MAGIC_STRING)
        project_tags = json.loads(response)
        return project_tags

    def projects_list(self):
        """Returns an alphabetically ordered list of projects as reported by Gerrit."""
        url = urljoin(self.BASE_URL, 'projects/')
        response = requests.get(url).text.lstrip(self.GERRIT_MAGIC_STRING)
        projects = json.loads(response)
        return sorted(list(projects))
