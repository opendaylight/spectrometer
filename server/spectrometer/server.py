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


@click.group()
def cli():
    pass


@click.command()
@click.option('-c', '--conf', default='/etc/spectrometer/config.py')
def start(conf):
    """Runs the spectrometer server

    This function is effectively the spectrometer main() function and is the
    entry point for spectrometer server.
    """
    click.echo('Starting spectrometer...')

    app = create_app(conf)
    app.run(
        threaded=True,
        host=app.config['LISTEN_HOST'],
        port=app.config['LISTEN_PORT'],
    )


cli.add_command(start)
