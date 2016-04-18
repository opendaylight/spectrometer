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


def check_parameters(mapping):
    """Returns error message if a required parameter is missing.

    This function accepts a dictionary mapping of values and returns an error
    if a required parameter is missing. Required parameters are marked by using
    the None type.

    Example:

        mapping = {
            'project': request.args.get('project', None),
            'branch': request.args.get('branch', 'master'),
        }

    In this example 'project' is a required parameter so the get() method
    defaults to None indicating that it is a required parameter. On the other
    hand 'branch' is an optional parameter so we set a default value master in
    the event that branch is not explicitly passed.
    """
    for key, value in mapping.items():
        if value is None:
            error = {'error': 'Missing parameter {parameter}.'.format(
                parameter=key)}
            return error
