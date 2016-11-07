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
 * Map Reducer functions to convert projects, commits, authors, organizations, timelines into meaningful X,Y data series
 *  that will be consumed by tables, charts and summaries in the UI components
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import _ from 'lodash'
import moment from 'moment'
import {parseProjectFromUrl, toMonthYearFormat} from '../utils/utils'

import * as Branches from './branches'

const logger = global.logger || require('../logger');

/**
 * slices a series to a given number and puts the rest of them in "Other" bucket
 * @returns array, sliced data series
 */
export function sliceLeftAndGroupOthers(series, sliceSize, field) {
  if (series.length > sliceSize) {
    let newSeries = series.slice(0, sliceSize-1)
    newSeries.push({name: 'Others', [field]: _(series.slice(sliceSize)).map(field).sum().valueOf()})
    return newSeries
  }
  return series;
}

/**
 * slices a series to a given number and puts the rest of them in "Other" bucket
 * @returns array, sliced data series
 */
export function sliceAndGroupOthers(series, sliceSize, field) {
  if (series.length > sliceSize) {
    let newSeries = series.slice(series.length - sliceSize)
    newSeries.push({name: 'Others', [field]: _(series.slice(0, series.length - sliceSize - 1)).map(field).sum().valueOf()})
    return newSeries
  }
  return series;
}

/**
 * filters only the master projects from the projects array
 * this is used to construct home page (top 10) charts
 * @param projects = [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @returns array, only the master branch of all the projects
 */
export function filterMasterProjects(projects) {
  return _.filter(projects, (x) => { return x.ref1 === 'master' && x.ref2 === 'master'} )
}

/**
 * find a particular branch of a particular project
 * @param projects = [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param options = { name, ref1 = 'master', ref2 = 'master' }
 * @returns object, only one project that meets ref1-ref2 criteria
 */
export function findBranchProject(projects, options = {}) {
  const {name, ref1 = 'master', ref2 = 'master'} = options
  return _.find(projects, (x) => { return x.name === name && x.ref1 === ref1 && x.ref2 === ref2} )
}

/**
 * finds only master branch project
 * alias for findBranchProject(projects, {name})
 * @param projects = [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param name = project name
 * @returns object, only one project of master branch
 */
export function findMasterBranchProjects(projects, name) {
  return findBranchProject(projects, {name})
}

/**
 * find the master branch of a given project, then find the stable branches in that project.
 * used for viewing data only in a specific stable release branch (commits_since_ref)
 * code = {M, Be, Li, He, H}
 * enabled = true, if the project is released in that stable branch
 * @param projects = [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param name = project name
 * @returns array, [name, code, ref1, ref2, enabled]
 */
export function findBranchActions(projects, name) {
  //only the master contains master.branches property which is a list[string] of stable branches
  const master = findMasterBranchProjects(projects, name)
  //all stable branch names for this project
  return _.map(Branches.BranchMap, x => {
    return {
      name: x.name, code: x.code, ref1: x.name === 'master', ref2: x.name === 'master', enabled: _.indexOf(master.branches, x.name) >= 0
    }
  })
}

/**
 * maps the commits to web desired format
 * web desired format = add organization field, remove commits.committed_* fields and commits.message fields to reduce payload size
 * sorts commits by authored_date asc to desc (earliest authored is index 0)
 * @param commits array
 * @returns array of commits, [{author, author_email, authored_date, author_tz_offset, organization, insertions, deletions, files}, {} ...]
 */
export function mapCommits(commits) {
  // logger.info("data-reducers:mapCommits", commits.length)
  return _(commits).map((c, index) => {
    return {
      author: c.author,
      author_email: c.author_email,
      authored_date: c.authored_date*1000,
      author_tz_offset: c.author_tz_offset,
      organization: c.author_email.split('@')[1],
      insertions: c.lines.insertions,
      deletions: c.lines.deletions,
      files: c.lines.files
    }
  }).sortBy('authored_date').valueOf()
}

/**
 * map a project's commits from original format to web desired format
 * @param name = project name
 * @param ref1, ref2
 * @param commits = commits to map
 * @returns object, {name, ref1, ref2, commits}
 */
export function mapProjectCommits(name, ref1, ref2, commits) {
  logger.info("data-reducers:mapProjectCommits", name, ref1, ref2, commits.length)
  return {
    name, ref1, ref2,
    commits: mapCommits(commits)
  }
}

/**
 * Map the response from axios and extract project branches info from each
 * called when data is initialized on server for the first time
 * eventually can be used when from ui client want to fetch multiple projects (no use case now)
 */
export function mapProjectsBranches(response) {
  logger.info("data-reducers:mapProjectsBranches")
  return _.map(response, (x) => {
    logger.info("data-reducers:mapProjectsBranches:", x.config.url)
    return {
      name: parseProjectFromUrl(x.config.url),
      branches: x.data.branches
    }
  })
}

/**
 * Map the response from axios and extract project info from each
 * called when data is initialized on server for the first time
 * eventually can be used when from ui client want to fetch multiple projects (no use case now)
 */
export function mapProjects(response) {
  return _.map(response, (x, index) => {
    const name = parseProjectFromUrl(x.config.url)
    logger.info('data-reducers:mapProjects', index, name)
    return mapProjectCommits(name, 'master', 'master', x.data.commits || [])
  })
}

/**
 * finds recent $projectLimit commits from each project upto $totalLimit projects
 * this gives a distribution of recent commits from each project, instead of recent commits of all projects
 * @param projects = [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param projectLimit = number of recent commits to take from each project
 * @param totalLimit = number of total commits to take
 * @returns [{name: aaa, commits: [...]}, {name: controller, commits: [...]}]
 */
export function recentCommits(projects, projectLimit = 5, totalLimit = 10) {
  return _(projects).map(p => {
    return {
      name: p.name,
      commits: _.takeRight(p.commits, projectLimit)
    }
  })
  .flatten().sortBy((x) => !_.isEmpty(x.commits) ? x.commits[0].authored_date : null)
  .takeRight(totalLimit)
  .reverse()
  .valueOf()
}

/**
 * filter one project's commits by multiple options
 * filter commits for a single organization AND/OR single author AND/OR range of dates
 * multiple filters can be applied at the same time
 * if options is empty, original commits are returned without any filtering
 * @example filterCommits(commits, {organization: 'gmail.com', author: 'John'}) will return commits by John from that organization
 * @param commits = array of commits of a single project
 * @param options = {organization, author, startDate, endDate}
 * @returns filtered commits based on given options
 */
const filterCommits = (commits, options = {}) => {
  const { organization, author, startDate, endDate } = options
  const c0 = _(commits)
    .filter(c => organization ? (c.organization === organization) : c )
    .filter(c => author ? (c.author === author) : c )
    .filter(c => startDate ? (c.authored_date >= startDate) : c )
    .filter(c => endDate ? (c.authored_date <= endDate) : c )
    .valueOf()
  // logger.info("filterCommits: options", options, "original count:", commits.length, "filter count:", c0.length)
  return c0
}

/**
 * sums up commit and loc count by a given contributor
 * @example sumCommitCountByContributor(commits, 'John') will return {name: John, commitCount: 250, loc: 3000}
 * @param commits = commits array of a single project
 * @param contributor = a string of either 'organization' or 'author'
 * @returns [{name: string, commitCount: number, loc: number}]
 */
const sumCommitCountByContributor = (commits, key) => {
  const c0 = _(commits)
    .transform((r,v) => {
      let a0 = _.find(r, {name: v[key]})
      if (a0) {
        a0.commitCount += 1
        a0.loc += (v.insertions || 0) + (v.deletions || 0)
      } else {
        r.push({name: v[key], commitCount: 1, loc: (v.insertions || 0) + (v.deletions || 0)})
      }
    }, [])
    .valueOf()

  // logger.info("sumCommitCountByContributor", key, c0)
  return c0
}

/**
 * maps each project's commits after filtering by various options
 * @param projects = [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param options = {name, organization, author, startDate, endDate}
 * @returns [{name: aaa, commits: [...]}, {name: controller, commits: [...]}]
 */
export function projectsVsCommits(projects, options = {}) {
  const { name, ref1, ref2, organization, author, startDate, endDate } = options
  logger.info("data-reducers:projectsVsCommits", projects.length, options)
  return _(projects)
    .filter(p => name ? p.name === name : p)
    .filter(p => (ref1 && ref2) ? (p.ref1 === ref1 && p.ref2 === ref2) : p)
    .map(x => { return { name: x.name, commits: filterCommits(x.commits, options) }} )
    .filter(x => x.commits.length > 0)
    .valueOf()
}

/**
 * find each project's commit count find commit count after applying given criteria
 * @param projects: [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param options: {name, organization, author, startDate, endDate, takeLeft, takeRight, sortBy = 'x'}
 * sortBy: x => name, y => commitCount
 * takeRight: is used to pick the top 10 commits
 * @returns [ {name: aaa, commitCount: 200, loc: 30000}, {name: bgp, commitCount: 150, loc: 4000}, ...]
 */
export function projectsVsCommitCount(projects, options = {}) {
  logger.info("data-reducers:projectsVsCommitCount", projects.length, options)
  const { name, ref1, ref2, organization, author, startDate, endDate, takeLeft, takeRight, sortBy} = options
  let c0 = projectsVsCommits(projects, options)
  let result = _(c0)
    .map(x => { return { name: x.name, commitCount: x.commits ? x.commits.length : 0, loc: _.sumBy(x.commits, c => (c.insertions || 0) + (c.deletions || 0) )} })
    .sortBy(sortBy)

  result = takeLeft ? result.take(takeLeft) : result
  result = takeRight ? result.takeRight(takeRight) : result
  return result.valueOf()
}

/**
 * find each project's contibutors by contributor key (organization | author)
 * @param projects: [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param options: { name, ref1, ref2, organization, author, contributor }
 * @returns [ {name: aaa, contributors: []}, {name: bgp, contributors: []}, ...]
 */
export function projectsVsContributors(projects, options = {}) {
  logger.info("data-reducers:projectsVsContributors", options)
  const { name, ref1, ref2, organization, author, contributor } = options
   //contributor is one of ['author', 'organization']
   return _(projects)
    .filter(p => name ? p.name === name : p)
    .filter(p => (ref1 && ref2) ? (p.ref1 === ref1 && p.ref2 === ref2) : p)
    .map(x => { return { name: x.name, commits: filterCommits(x.commits, options) }} )
    .map(x => { return { name: x.name, contributors: _(x.commits).map(contributor).uniq().orderBy().valueOf() }})
    .valueOf()
}

/**
 * find each project's contibutor count by contributor key (organization | author)
 * @param projects: [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param options: { name, ref1, ref2, organization, author, contributor }
 * @returns [ {name: aaa, contributorCount: 200}, {name: bgp, contributorCount: 300}, ...]
 */
export function projectsVsContributorCount(projects, options = {}) {
  const {sortBy} = options
  const p0 = projectsVsContributors(projects, options)
  return _(p0)
    .map(x => { return { name: x.name, contributorCount: x.contributors.length }})
    .sortBy(sortBy)
    .valueOf()
}

/**
 * find all contributors by contributor key (organization | author)
 * @param projects: [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param options: { name, ref1, ref2, organization, author, contributor }
 * @returns  [contributor1, contributor2, ...]
 */
export function allContributors(projects, options = {}) {
  const p0 = projectsVsContributors(projects, options)
  return _(p0).map('contributors').flatten().uniq().orderBy().valueOf()
}

/**
 * find commit count per organization
 * @param projects: [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param options: { name, ref1, ref2, organization, takeLeft, takeRight, sortBy = 'x' }
 * @returns [ {name: org1, commitCount: 200}, {name: org2, commitCount: 300}, ...]
 */
export function organizationsVsCommitCount(projects, options = {}) {
  logger.info("organizationsVsCommitCount", projects.length, options)
  const {name, ref1, ref2, takeLeft, takeRight, sortBy} = options
  let result = _(projects)
    .filter(p => name ? p.name === name : p)
    .filter(p => (ref1 && ref2) ? (p.ref1 === ref1 && p.ref2 === ref2) : p)
    .map(p => { return sumCommitCountByContributor(filterCommits(p.commits, options), 'organization')})
    .flatten()
    .groupBy('name')
    .transform( (r, v, k) => {
      r.push( {name: k, commitCount: _.sumBy(v, 'commitCount'),  loc: _.sumBy(v, 'loc')} )
    }, [])
    .sortBy(sortBy)

  result = takeLeft ? result.take(takeLeft) : result
  result = takeRight ? result.takeRight(takeRight) : result
  return result.valueOf()
}

/**
 * find commit count per author
 * @param projects: [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param options: { name, ref1, ref2, takeLeft, takeRight, sortBy = 'x' }
 * @returns [ {name: author1, commitCount: 200}, {name: author2, commitCount: 300}, ...]
 */
export function authorsVsCommitCount(projects, options = {}) {
  logger.info("authorsVsCommitCount", projects.length, options)
  const {name, ref1, ref2, takeLeft, takeRight, sortBy} = options
  let result = _(projects)
    .filter(p => name ? p.name === name : p)
    .filter(p => (ref1 && ref2) ? (p.ref1 === ref1 && p.ref2 === ref2) : p)
    .map(p => sumCommitCountByContributor(filterCommits(p.commits, options), 'author'))
    .flatten()
    .groupBy('name')
    .transform( (r, v, k) => {
      r.push( {name: k, commitCount: _.sumBy(v, 'commitCount'),  loc: _.sumBy(v, 'loc')} )
    }, [])
    .sortBy(sortBy)

  result = takeLeft ? result.take(takeLeft) : result
  result = takeRight ? result.takeRight(takeRight) : result
  // logger.info("authorsVsCommitCount", projects.length, options, result.valueOf())
  return result.valueOf()
}

/**
 * find commit count per project by time
 * @param projects: [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param options: { name, ref1, ref2, takeLeft, takeRight, sortBy }
 * @returns [ {name: 'aaa', timeline: [{name: 'Mar-2014',commitCount: 200, loc: 2500}, ...]}, {name: 'bgp', timeline: [{name: 'Mar-2014',commitCount: 300, loc: 23500}, ...]},  ...]
 */
export function timeVsProjectsCommitCount(projects, options = {}) {
  logger.info("timeVsProjectsCommitCount", projects.length, options)
  const {name, ref1, ref2} = options
  let result = _(projects)
    .filter(p => name ? p.name === name : p)
    .filter(p => (ref1 && ref2) ? (p.ref1 === ref1 && p.ref2 === ref2) : p)
    .map(x => { return { name: x.name, commits: filterCommits(x.commits, options) }} )
    .map(x => { return {
      name: x.name,
      timeline: _(x.commits).groupBy(c => toMonthYearFormat(c.authored_date))
                            .transform((r,v,k) => { r.push({name: k, commitCount: v.length, loc: _.sumBy(v, c => (c.insertions || 0) + (c.deletions || 0)) })},[]).valueOf()
      }
    }).valueOf()
  // logger.info("timeVsProjectsCommitCount", result)
  return result
}

/**
 * find commit count for all projects (aggregated commitcount of projects by time)
 * @param projects: [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param options: { name, ref1, ref2, takeLeft, takeRight, sortBy}
 * @returns [ {name: 'Mar-2014', commitCount: 500, loc: 5000}, {name: 'Apr-2014', commitCount: 300, loc: 20000}, ...]
 */
export function timeVsCommitCount(projects, options={}) {
  const {takeLeft, takeRight} = options
  const c0 = timeVsProjectsCommitCount(projects, options)
  let result = _(c0)
    .map("timeline")
    .flatten()
    .groupBy(x => x.name)
    .transform((r,v,k) => {r.push({ name: k, commitCount: _.sumBy(v, 'commitCount'), loc: _.sumBy(v, 'loc') })}, [])

  result = takeLeft ? result.take(takeLeft) : result
  result = takeRight ? result.takeRight(takeRight) : result
  const r0 = result.sortBy(x => moment(x.name).unix(Number)).valueOf()
  return r0
}

/**
 * UNUSED
 * Question: How many LOC insertions+deletions+files per Month for ONE Project
 * collects commit lines of code grouped by month
 */
export function timeVsLocDetailsForOneProject(project) {
  let m = _(project.commits).map(c => {
    return {
      time: toMonthYearFormat(c.authored_date),
      insertions: c.insertions,
      deletions: c.deletions,
      files: c.files
    }
  })
  .groupBy('time')
  .reduce( (result, value, key) => {
    let insertions = _.reduce(value, (r, v) => { return r + v.insertions} , 0)
    let deletions = _.reduce(value, (r, v) => { return r + v.deletions} , 0)
    let files = _.reduce(value, (r, v) => { return r + v.files} , 0)
    result.push( {time: key, insertions, deletions, files} )
    return result
  }, [])
  .valueOf()

  return m
}

/**
 * find first date of when each project was started
 * @param projects: [{name: aaa, ref1: master, ref2: master, commits}, {name: aaa, ref1: stable/helium, ref2: stable/helium, commits} ...]
 * @param options: { sortBy = 'x' }
 * @returns [ {name: 'aaa', firstCommit: 'Mar-2014', lastCommit: 'Apr-2016'}, ...]
 */
export function timeVsProjectsInitiation(projects, options) {
  const {sortBy = 'x'} = options
  return _(projects)
    .map(x => {
      return {
        name: x.name,
        firstCommit: !_.isEmpty(x.commits) ? x.commits[0].authored_date : 0,
        lastCommit: !_.isEmpty(x.commits) ? x.commits[x.commits.length - 1].authored_date : 0
      }
    })
    .sortBy(sortBy === 'x' ? 'name' : 'firstCommit')
    .valueOf()
}

/**
 * Question: Which projects did this Organization contribute to?
 * @returns projects which has commits that has this organization
 */
export function projectsContainingOrganization(projects, organization) {
  return _(projects)
    .filter(p => _.some(p.commits, {organization}))
    .valueOf()
}

/**
* Question: Which projects did this Author contribute to?
* @returns projects which has commits that has this author
 */
export function projectsContainingAuthor(projects, author) {
  return _(projects)
    .filter(p => _.some(p.commits, {author}))
    .valueOf()
}

/**
 * Question: Who did what most ? Who did what second most ?
 * Question: Who did what least ? Who did what second least ?
 * Eg: Who committed most? Who committed least?
 * @returns { most1: object, most2: object, least1: object, least2: object }
 */
export function mostAndLeast(array, key) {
  const most1 = _.maxBy(array, key) //find the object with maximum value
  const most2 = _.maxBy(_.without(array, most1), key) //find the object with maximum value, except the most1
  const least1 = _.minBy(array, key) // find the object with minimum value
  const least2 = _.minBy(_.without(array, least1), key) //find the object with maximum value, except the least1
  return { most1, most2, least1, least2 }
}

/**
 * Question: How many authors did an organization contribute for one project?
 */
export function organizationsVsAuthorCountForOneProject(project, sortBy='x') {
  return _(project.commits)
          .uniqBy('author')
          .countBy('organization')
          .map((v,k) => { return { name: k, authorCount: v } })
          .sortBy(sortBy === 'x' ? 'name' : 'authorCount')
          .valueOf()
}

/**
 * Question: How many authors did an organization contribute for one project?
 * find all authors per organization and get only unique authors
 */
export function organizationsVsAuthorsForOneProject(project, sortBy='x') {
  return _(project.commits)
          .groupBy('organization')
          .map((v,k) => { return { name: k, authors: _(v).map('author').uniq().valueOf() } })
          .valueOf()
}

/**
 * Question: Which authors did an organization contribute for ALL projects?
 */
export function organizationsVsAuthorsForAllProjects(projects, sortBy='x') {
  return _(projects).map(x => {
    return organizationsVsAuthorsForOneProject(x)
  })
  .flatten()
  .groupBy('name')
  .transform((r,v,k) => { r.push({ name: k, authors: _(v).map('authors').flatten().uniq().valueOf() }) }, [])
  .valueOf()
}

/**
 * Question: How many authors did an organization contribute for ALL projects?
 */
export function organizationsVsAuthorsCountForAllProjects(projects, sortBy='x') {
  return _(projects).map(x => {
    return organizationsVsAuthorsForOneProject(x)
  })
  .flatten()
  .groupBy('name')
  .transform((r,v,k) => { r.push({ name: k, authors: _(v).map('authors').flatten().uniq().valueOf() }) }, [])
  .map(x => { return { name: x.name, authorCount: x.authors.length } })
  .sortBy('authorCount')
  .valueOf()
}
