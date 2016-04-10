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

# todo: http://flask.pocoo.org/snippets/83/


def status():
    """Returns a status page

    The purpose of this page is to allow the administrator to know that
    spectrometer-web is operating correctly.
    """
    html = "Spectrometer status page"
    return html
