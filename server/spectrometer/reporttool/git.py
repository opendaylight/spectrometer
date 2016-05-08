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

from collections import Counter
from collections import OrderedDict
import re
import time
import urllib

import requests
from tabulate import tabulate


class GitReport():
    def __init__(self, server_url, ref1, ref2):
        self.server_url = server_url
        self.ref1 = ref1
        self.ref2 = ref2

        # Initialize Counters
        self.authors = Counter()
        self.authors_by_email = Counter()
        self.organizations = Counter()
        self.projects = Counter()
        self.tz_data = Counter()

        self._fetch_data()

    def _fetch_data(self):
        """Fetch commit data from Spectrometer APIs"""
        print('Fetching GitReport data...')
        url = urllib.parse.urljoin(self.server_url, 'gerrit/projects')
        projects = requests.get(url).json().get('projects')

        # Remove Gerrit special repos
        if 'All-Users' in projects:
            projects.remove('All-Users')

        self.commits = []
        for project in projects:
            url = urllib.parse.urljoin(
                self.server_url,
                'git/commits_since_ref?project={0}&ref1={1}&ref2={2}'.format(
                    project, self.ref1, self.ref2)
            )
            data = requests.get(url).json()
            self.commits.extend(data.get('commits', []))
            self.projects[project] = len(data.get('commits', []))

    def _process_report(self):
        """Processes data to generate a report"""
        for c in self.commits:
            author_email = c['author_email']
            author_tz_offset = c['author_tz_offset']
            commit_message = c['message']
            organization = c['author_email'].split('@', 1)[-1]

            self._process_author_contributions(author_email, commit_message)
            self._process_tz_offset(author_tz_offset)
            self.organizations[organization] += 1

        self._process_author_names()

    def _process_author_contributions(self, author_email, commit_message):
        """Process author contributions by their unique email addresses"""
        self.authors_by_email[author_email] += 1

        result = re.findall('(?:Also-By|Co-Authored-By): (.+) <(.+)>', commit_message)
        for name, email in result:
            self.authors_by_email[email] += 1
            self.organizations[email.split('@', 1)[-1]] += 1

    def _process_author_names(self):
        """Convert author emails to their name as determined by commit metadata"""
        keys = self.authors_by_email.keys()
        _dict = OrderedDict()

        for email in keys:
            for commit in self.commits:
                if commit["author_email"] == email:
                    _dict['{0}:{1}'.format(commit['author'], commit['author_email'])] = self.authors_by_email[email]
                    break

        self.authors = Counter(_dict)

    def _process_tz_offset(self, offset):
        """Process timezone data"""
        if offset > 0:
            _time = time.strftime('-%H%M', time.gmtime(offset))
        else:
            _time = time.strftime('+%H%M', time.gmtime(abs(offset)))
        self.tz_data['UTC{0}'.format(_time)] += 1

    def print_report(self):
        """Prints a project report for Git contributions"""
        self._process_report()

        print('\nOpenDaylight Project Statistics for {0} since {1}'.format(self.ref1, self.ref2))
        print('\nTotal OpenDaylight projects: {0}'.format(len(self.projects)))
        print('Total Contributors: {0}'.format(len(self.authors)))
        print('Total Organizations: {0}'.format(len(self.organizations)))
        print('Total Commits: {0}'.format(len(self.commits)))

        top_authors = ['{0} ({1})'.format(k.split(':')[0], v) for k, v in OrderedDict(self.authors.most_common(10)).items()]  # noqa
        top_organizations = ['{0} ({1})'.format(k, v) for k, v in OrderedDict(self.organizations.most_common(10)).items()]  # noqa
        top_projects = ['{0} ({1})'.format(k, v) for k, v in OrderedDict(self.projects.most_common(10)).items()]
        all_timezones = sorted(['{0} ({1})'.format(k, v) for k, v in self.tz_data.items()])
        table = OrderedDict()
        table['Top 10 Projects'] = top_projects
        table['Top 10 Contributors'] = top_authors
        table['Top 10 Organizations'] = top_organizations
        table['Timezones'] = all_timezones
        print('\n')
        print(tabulate(table, headers='keys'))

        all_authors = sorted(['{0} ({1})'.format(k.split(':')[0], v) for k, v in self.authors.items()])
        all_organizations = sorted(['{0} ({1})'.format(k, v) for k, v in self.organizations.items()])
        all_projects = sorted(['{0} ({1})'.format(k, v) for k, v in self.projects.items()])
        table = OrderedDict()
        table['All Projects'] = all_projects
        table['All Contributors'] = all_authors
        table['All Organizations'] = all_organizations
        print('\n')
        print(tabulate(table, headers='keys'))
