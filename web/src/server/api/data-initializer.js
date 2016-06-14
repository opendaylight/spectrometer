import axios from 'axios'
import _ from 'lodash'

import { mapProjectsBranches, mapProjects }  from './data-reducers'

/**
 * load project names from api server
 * @param url http://$apiServerUrl
 * @returns array of project names loaded from apiServerUrl via gerrit api
 */
export function loadProjectNames(url) {
  return new Promise((resolve, reject) => {
    console.info(`data-initializer:loadProjectNames start... (${url})`)
    axios.get(`${url}/gerrit/projects`)
      .then((response) => {
        console.info("data-initializer:loadProjectNames complete:", response.data.projects.length, " project names loaded.")
        resolve(_(response.data.projects).sortBy().reject(n => n.indexOf('integration') >= 0 || n.indexOf('controller') >= 0).slice(1,10).valueOf())
        //remove All-Users projects, as that does not contain data
        // resolve(_(response.data.projects).sortBy().slice(1).valueOf())
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
    console.log('data-initializer:loadBranches start...')
    const urls = _.map(names, (p) => {
      return axios.get(`${url}/git/branches?project=${p}`)
    })
    axios.all(urls).then((response) => {
      const projectsBranches = mapProjectsBranches(response)
      console.log("data-initializer:loadBranches complete")
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
  console.info('data-initializer:loadCommits start...')
  const n0 = names //_.reject(names, n => n.indexOf('integration') >= 0 || n.indexOf('controller') >= 0)
  return new Promise((resolve, reject) => {
    let urls = _.map(n0, (p) => {
      return axios.get(`${url}/git/commits?project=${p}`)
    })
    let projects = []
    axios.all(urls)
      .then((response) => {
        console.log("data-initializer:loadCommits all data retrieved, resolving commits")
        const projects = mapProjects(response)
        console.log("data-initializer:loadCommits complete")
        resolve(projects)
    })
  })
}
