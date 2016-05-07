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

import logging
import time

log = logging.getLogger(__name__)


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


def get_cache(collection, data_id, no_cache, func, func_args):
    """Retrieves data from function unless no_cache is set

    Cache is skipped if no_cache is True, or cached data does not exist or
    cache_age (seconds) is too old.

    :arg str collection: Mongo collection to search. (required)
    :arg str data_id: Cache ID of data. (required)
    :arg bool no_cache: Whether or not to skip cache. (required)
    :arg func func: Function to retrieve data from if cache is skipped. (required)
    :arg list func_args: Arguments to pass to func. (required)
    """
    cache = collection.find_one({'_id': data_id})
    cache_age = 0
    data = None

    if cache:
        cache_age = time.time() - cache.get('age', time.mktime(time.gmtime(0)))
        data = cache['data']

    if not data or no_cache or cache_age > 300:  # Default cache_age to 5 minutes
        log.debug("Caching {0} {1}".format(func.__name__, data_id))
        data = func(*func_args)
        set_cache(collection, data_id, data)

    return data


def set_cache(collection, data_id, data):
    """Set cache data

    :arg str collection: Mongo collection to save into cache. (required)
    :arg str data_id: Cache ID of data. (required)
    :arg str data: Data to save into cache. (required)
    """
    document = {
        '_id': data_id,
        'age': time.time(),
        'data': data,
    }
    collection.replace_one({'_id': data_id}, document, upsert=True)
