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
 * Initializes data when NodeJS starts
 * Loads all the projectNames via /git/projects
 * Loads all branches for each projectName
 * Asynchronously reads all the master branches for every projectName
 * After all async read is complete, collates all project info (name, commits, branches) under a single "projects" object
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import axios from 'axios'
import _ from 'lodash'

import { mapProjectsBranches, mapProjects }  from './data-reducers'

/**
 * load project names from api server
 * @param url: API Url in format http://$apiServerUrl
 * @param projectsToLoad: load only a few projects (supplied by -p parameter), used in development to speed up loading
 * @returns array of project names loaded from apiServerUrl via gerrit api
 */
export function loadProjectNames(url, projectsToLoad) {
  return new Promise((resolve, reject) => {
    logger.info(`data-initializer:loadProjectNames`)
    axios.get(`${url}/gerrit/projects`)
      .then((response) => {
        logger.info(`data-initializer:loadProjectNames: total projects: ${response.data.projects.length}`)
        logger.info(`data-initializer:loadProjectNames: loading ${projectsToLoad || 'ALL'} projects`)
        resolve(_(response.data.projects)
          // .reject( n => (n.indexOf('bgpcep') >= 0 || n.indexOf('controller') >= 0))
          .sortBy()
          .take(projectsToLoad || response.data.projects.length)
          .valueOf())
      })
    })
}

/**
 * load branches from api server
 * @param url http://$apiServerUrl
 * @param names array of project names obtained from gerrit api
 * @returns [ {name: aaa, branches: [master, stable/lithium, stable/helium]}, {...} ]
 */
export function loadBranches(url, names) {
  return new Promise((resolve, reject) => {
    logger.info('data-initializer:loadBranches')
    const urls = _.map(names, (p) => {
      return axios.get(`${url}/git/branches?project=${p}`)
    })
    axios.all(urls).then((response) => {
      const projectsBranches = mapProjectsBranches(response)
      logger.info("data-initializer:loadBranches complete")
      resolve(projectsBranches)
    })
  })
}

/**
 * load commits from api server
 * @param url http://$apiServerUrl
 * @param names array of project names obtained from gerrit api
 * @returns [ {name: aaa, commits: [...] }, {...} ]
 */
export function loadCommits(url, names) {
  logger.info('data-initializer:loadCommits started. This will take a while, please wait until all commits are loaded...')
  const n0 = names
  return new Promise((resolve, reject) => {
    let urls = _.map(n0, (p) => {
      return axios.get(`${url}/git/commits?project=${p}`)
    })
    let projects = []
    axios.all(urls)
      .then((response) => {
        logger.info("data-initializer:loadCommits all data retrieved, resolving commits")
        const projects = mapProjects(response)
        logger.info("data-initializer:loadCommits complete")
        resolve(projects)
    })
  })
}
