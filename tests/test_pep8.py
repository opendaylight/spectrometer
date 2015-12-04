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

import pep8


def test_pep8_conformance():
    """Test that we conform to PEP8."""
    files_to_check = ['./spectrometer/githelpers.py',
                      './spectrometer/dashboard/views.py']
    pep8style = pep8.StyleGuide(quiet=True)
    result = pep8style.check_files(files_to_check)
    print(result.counters)
    if result.counters.get('E902', False):
        print('Could not find/open one of files')
    assert result.total_errors == 0
