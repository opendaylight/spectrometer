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
 * React Routes
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import { IndexRoute, Redirect, Route } from 'react-router';
import React from "react";

import App from "./components/app";
import HomePage from './components/home-page'
import ProjectsPage from './components/projects-page'
import AuthorsPage from './components/authors-page'
import OrganizationsPage from './components/organizations-page'
import error404 from "./components/404";

export default (
  <Route name="app" path="/" component={App}>
    <IndexRoute component={HomePage}/>
    <Route path="home" component={HomePage} />
    <Route path="projects" component={ProjectsPage} />
    <Route path="authors" component={AuthorsPage} />
    <Route path="organizations" component={OrganizationsPage} />
    <Route path="*" component={error404}/>
  </Route>
);
