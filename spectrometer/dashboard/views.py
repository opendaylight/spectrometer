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

views.py: Web App

"""


from flask import json, jsonify, Response
from spectrometer.githelpers import GitHandler
from spectrometer.dashboard import app
# todo: http://flask.pocoo.org/snippets/83/


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/git/<module_name>')
def git_stat(module_name):
    git_handle = GitHandler(module_name)
    stats = git_handle.get_commits_stat()
    # return Response(response=json.dumps(stats,indent=2,
    #  separators=(',', ': ')), status=200, mimetype='application/json')
    return jsonify(stats)


@app.route('/gerrit/<module_name>')
def gerrit_stat(moduel_name):
    return "Not implemented"
