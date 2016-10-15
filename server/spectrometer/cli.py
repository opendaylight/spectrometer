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

import click

from spectrometer import create_app
from spectrometer import mirror_repos
from spectrometer.reporttool.git import GitReport


@click.group()
@click.pass_context
@click.version_option()
def cli(ctx):
    pass


###############################################################################
# Server
###############################################################################

@cli.group()
@click.option('-c', '--conf', default='/etc/spectrometer/config.py')
@click.pass_context
def server(ctx, conf):
    ctx.obj['conf'] = conf


@click.command()
@click.pass_context
def sync(ctx):
    """Syncs Spectrometer data

    Force syncs the git repositories to pull down the latest data.
    """
    app = create_app(ctx.obj['conf'])
    gerrit_url = app.config['GERRIT_URL']
    mirror_dir = app.config['MIRROR_DIR']
    mirror_repos(mirror_dir, gerrit_url)


@click.command()
@click.pass_context
def start(ctx):
    """Runs the spectrometer server

    This function is effectively the spectrometer main() function and is the
    entry point for spectrometer server.
    """
    app = create_app(ctx.obj['conf'])

    click.echo('Syncing Spectrometer data...')
    gerrit_url = app.config['GERRIT_URL']
    mirror_dir = app.config['MIRROR_DIR']
    mirror_repos(mirror_dir, gerrit_url)

    click.echo('Starting spectrometer...')
    app.run(
        threaded=True,
        host=app.config['LISTEN_HOST'],
        port=app.config['LISTEN_PORT'],
    )


@click.command()
@click.pass_context
def profile(ctx):
    from werkzeug.contrib.profiler import ProfilerMiddleware
    from spectrometer import create_app

    app = create_app(ctx.obj['conf'])
    app.config['PROFILE'] = True
    app.wsgi_app = ProfilerMiddleware(app.wsgi_app, restrictions=[30])
    app.run(
        debug=True,
        host=app.config['LISTEN_HOST'],
        port=app.config['LISTEN_PORT'],
    )


server.add_command(sync)
server.add_command(start)
server.add_command(profile)


###############################################################################
# Report Tool
###############################################################################

@cli.group()
@click.option('--server-url', default='https://spectrometer.opendaylight.org/api/',
              help='URL to Spectrometer API server.')
@click.pass_context
def reporttool(ctx, server_url):
    """Entry point for the report tool command"""
    ctx.obj['SERVER_URL'] = server_url


@click.command()
@click.argument('ref1')
@click.argument('ref2')
@click.pass_context
def full(ctx, ref1, ref2):
    """Generate a full report"""
    git_data = GitReport(ctx.obj['SERVER_URL'], ref1, ref2)
    git_data.print_report()


reporttool.add_command(full)

cli(obj={})
