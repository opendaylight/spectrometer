/**
# @License EPL-1.0 <http://spdx.org/licenses/EPL-1.0>
##############################################################################
# Copyright (c) 2016 The Linux Foundation and others.
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Eclipse Public License v1.0
# which accompanies this distribution, and is available at
# http://www.eclipse.org/legal/epl-v10.html
##############################################################################
*/

/**
 * React component to display 404 Page
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import React, { Component } from 'react';
import { Link } from 'react-router';

class Error404 extends Component {

  render() {
    return (
        <div className="page">
          <h1 className="page-title">404: Page not found</h1>
          <p className="lead">Sorry, we've misplaced that URL or it's pointing to something that does not exist.</p>
          <p><Link to="/home" className="sidebar-nav-item" activeClassName="active">&gt; Head back home</Link></p>
        </div>
    );
  }
}

export default Error404;
