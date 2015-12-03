# Copyright (c) 2015,  Mohammed Hassan Zahraee

# All rights reserved.

# Redistribution and use in source and binary forms, with or without
# modification, are permitted provided that the following conditions are met:

# 1. Redistributions of source code must retain the above copyright notice,
# this list of conditions and the following disclaimer.

# 2. Redistributions in binary form must reproduce the above copyright notice,
# this list of conditions and the following disclaimer in the documentation
# and/or other materials provided with the distribution.

# 3. Neither the name of the copyright holder nor the names of its
# contributors may be used to endorse or promote products derived from this
# software without specific prior written permission.

# THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
# AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
# IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
# ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
# LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
# CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
# SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
# INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
# CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
# ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
# THE POSSIBILITY OF SUCH DAMAGE.

"""

@authors: Mohammed Hassan Zahraee
@status: Development
@version: 1.0

githelpers.py: Git Helper

"""

from git import Repo
import time
import yaml
from dashboard import app


class GitHandler:
    def __init__(self, moduel_name):
        self.repo = self.get_modules_repo(moduel_name)

    def get_modules_repo(self, moduel_name):
        """
            finds a modules repository address from repositories.json file
            and returns a Repo object for the repository
            @:param module's name
            @:return repository object for the module
        """
        bare = True
        # todo: remove test and bare
        if moduel_name == 'test':
            bare = False
        with open(app.config['REPOSITORY_ADDRESSES']) as file:
            repositories = yaml.load(file)
        repo_address = repositories[moduel_name]['repo']
        return Repo.init(repo_address, bare=bare)

    def get_commits_stat(self):
        # todo: removing merging commits (more than 1 parent)
        stats = {'commits': []}
        for commit in self.repo.head.commit.iter_parents():
            commit_dic = {
                'hash': commit.hexsha,
                'lines': commit.stats.total,
                # UTC time
                'time': time.strftime("%d %b %Y %H:%M",
                                      time.gmtime(commit.committed_date)),
                'commiter': commit.author.name,
                'email': commit.author.email
            }
            stats['commits'].append(commit_dic)
        return stats
