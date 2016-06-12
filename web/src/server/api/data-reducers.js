/**
 * A collection of pure functions that reduces projects array into format as required for charts
 */
import _ from 'lodash'
import moment from 'moment'

const BRANCHES = [
  { name: 'master', code: 'M'},
  { name: 'stable/beryllium', code: 'Be'},
  { name: 'stable/lithium', code: 'Li'},
  { name: 'stable/helium', code: 'He'},
  { name: 'stable/hydrogen', code: 'H'}
]

export function toMonthYearFormat(time, timezone) {
  const k = moment(time*1000)
  return k.format('MMM')+'-'+k.year()
}

export function sliceAndGroupOthers(series, sliceSize, field) {
  if (series.length > sliceSize) {
    let newSeries = series.slice(0, sliceSize-1)
    newSeries.push({name: 'Others', [field]: _(series.slice(sliceSize)).map(field).sum().valueOf()})
    return newSeries
  }
  return series;
}

/**
 * Find the master branch of a given project, then find the stable branches in that project
 * used for viewing data only in a specific stable release branch (commits_since_ref)
 */
export function findBranchActions(projects, name) {
  //only the master contains master.branches property which is a list[string] of stable branches
  const master = findMasterBranchProjects(projects, name)
  //all stable branch names for this project
  // const stableBranches = _.filter(BRANCHES, x => _.indexOf(master.branches, x.name) >= 0)
  return _.map(BRANCHES, x => {
    return {
      name: x.name, code: x.code, ref1: x.name === 'master', ref2: x.name === 'master', enabled: _.indexOf(master.branches, x.name) >= 0
    }
  })
}

/**
 * git_commits_since_ref works only where ref1=newer, ref2=older branches chronologically
 * if user clicked out of sequence, readjust references to chronological sequence
 * this way ref1 is always newer branch, ref2 is always older branch
 * Sequence is 0 -> N as OLDEST -> NEWEST
 */
export function swapBranchRefs(ref1, ref2) {
  return (_.findIndex(BRANCHES, {name: ref2}) > _.findIndex(BRANCHES, {name: ref1})) ? [ref1, ref2] : [ref2,ref1]
}

/**
 * @returns only master branch of the projects
 */
export function filterMasterProjects(projects) {
  return _.filter(projects, (x) => { return x.ref1 === 'master' && x.ref2 === 'master'} )
}

/**
 * @returns only one project that meets ref1-ref2 criteria
 */
export function findBranchProject(projects, name, ref1, ref2) {
  return _.find(projects, (x) => { return x.name === name && x.ref1 === ref1 && x.ref2 === ref2} )
}

/**
 * @returns only master projects
 */
export function findMasterBranchProjects(projects, name) {
  return findBranchProject(projects, name, 'master', 'master')
}

/**
 * parses the project url to find the project name using regex
 * @param url http://$apiServerUrl/git/...?project=aaa
 * @returns aaa
 */
export function parseProjectFromUrl(url) {
  return url.match(/.*project=(.*)/)[1]
}

/**
 * Map the response from axios and extract project branches info from each
 * called when data is initialized on server for the first time
 * eventually can be used when from ui client want to fetch multiple projects (no use case now)
 */
export function mapProjectsBranches(response) {
  return _.map(response, (x) => {
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
    console.log('data-reducers:mapProjects', index, name)
    return mapProjectCommits(name, 'master', 'master', x.data.commits || [])
  })
}

/**
 * Map the project commits to web format
 */
export function mapProjectCommits(name, ref1, ref2, commits) {
  console.log("data-reducers:mapProjectCommits", name, ref1, ref2)
  return {
    name, ref1, ref2,
    commits: mapCommits(commits)
  }
}

/**
 * maps the commits to web format
 * web format: add organization field, remove commits.committed_* fields and commits.message fields to reduce payload size
 */
export function mapCommits(commits) {
  console.log("data-reducers:mapCommits", commits.length)
  return _(commits).map((c, index) => {
    return {
      author: c.author,
      author_email: c.author_email,
      authored_date: c.authored_date,
      author_tz_offset: c.author_tz_offset,
      organization: c.author_email.split('@')[1],
      insertions: c.lines.insertions,
      deletions: c.lines.deletions,
      files: c.lines.files
    }
  }).sortBy('authored_date').valueOf()
}


/**
 * Question: What is the timeline of projects started ?
 */
export function timelineForAllProjects(projects, sortBy = 'x') {
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
 * Question: How many commits per Month for ONE Project
 * collects commit lines of code grouped by month
 * returns [{time: 'Jun-2016', loc:2100}, {time: 'Jul-2016', loc: 4000}]
 */
export function timeVsCommitsForOneProject(project) {
  return _(project.commits)
    .countBy(x => toMonthYearFormat(x.authored_date))
    .map((v,k) => { return { time: k, commitCount: v } })
    .valueOf()
}

/**
 * Question: How many LOC commits per Month for ONE Project
 * collects commit lines of code grouped by month
 * returns [{time: 'Jun-2016', loc:2100}, {time: 'Jul-2016', loc: 4000}]
 */
export function timeVsLocForOneProject(project) {
  let m = _(project.commits).map(c => {
    return {
      time: toMonthYearFormat(c.authored_date),
      lines: c.insertions + c.deletions
    }
  })
  .groupBy('time')
  .reduce( (result, value, key) => {
    let loc = _.reduce(value, (r, v) => { return r + v.lines} , 0)
    result.push( {time: key, loc: loc} )
    return result
  }, [])
  .valueOf()

  return m
}

/**
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
 * What are the recent activities across all projects
 * @returns [{name: aaa, commits: [...]}, {name: controller, commits: [...]}]
 */
export function recentActivitiesForAllProjects(projects, projectLimit = 5, totalLimit = 10) {
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
 * Question: How many commits FOR ALL Projects ?
 * collects commit count from all projects
 * @returns [{name: aaa, commitCount: 25}, {name: affinity, commitCount: 30}]
 */
export function commitCountForAllProjects(projects, sortBy = 'x') {
  return _(projects)
    .map(x => { return { name: x.name, commitCount: x.commits ? x.commits.length : 0} })
    .sortBy(sortBy === 'x' ? 'name' : 'commitCount')
    .valueOf()
}

export function commitCountForAllProjectsPerOrg(projects, organization, sortBy = 'x') {
  // console.log("commitCountForAllProjectsPerOrg", projects)
  return _(projects)
    .map(x => { return { name: x.name, commits: _.filter(x.commits, c => c.organization === organization) }})
    .map(x => { return { name: x.name, commitCount: x.commits ? x.commits.length : 0} })
    .sortBy(sortBy === 'x' ? 'name' : 'commitCount')
    .valueOf()
}

export function commitCountForAllProjectsPerAuthor(projects, author, sortBy = 'x') {
  // console.log("commitCountForAllProjectsPerOrg", projects)
  return _(projects)
    .map(x => { return { name: x.name, commits: _.filter(x.commits, c => c.author === author) }})
    .map(x => { return { name: x.name, commitCount: x.commits ? x.commits.length : 0} })
    .sortBy(sortBy === 'x' ? 'name' : 'commitCount')
    .valueOf()
}

/**
 * Question: Which projects did this Organization contribute to?
 * @returns projects which has commits that has this organization
 */
export function projectsContainingOrganization(projects, organization) {
  // console.log("projectsContainingOrganization", projects)
  return _(projects)
    .filter(p => _.some(p.commits, {organization: organization}))
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
 * Question: How many number of LOC FOR ALL Projects
 * @returns [{name: aaa, loc: 2500}, {name: affinity, loc: 300}]
 */
export function locForAllProjects(projects, sortBy = 'x') {
  return _(projects)
    .map(x => { return { name: x.name, value: _.sumBy(x.commits, (c) => { return (c.insertions || 0) - (c.deletions || 0) } )} })
    .sortBy(sortBy === 'x' ? 'name' : 'value')
    .valueOf()
}

export function locForAllProjectsPerOrg(projects, organization, sortBy = 'x') {
  return _(projects)
    .map(x => { return { name: x.name, commits: _.filter(x.commits, c => c.organization === organization) }})
    .map(x => { return { name: x.name, value: _.sumBy(x.commits, (c) => { return (c.insertions || 0) - (c.deletions || 0) } )} })
    .sortBy(sortBy === 'x' ? 'name' : 'value')
    .valueOf()
}

export function locForAllProjectsPerAuthor(projects, author, sortBy = 'x') {
  return _(projects)
    .map(x => { return { name: x.name, commits: _.filter(x.commits, c => c.author === author) }})
    .map(x => { return { name: x.name, value: _.sumBy(x.commits, (c) => { return (c.insertions || 0) - (c.deletions || 0) } )} })
    .sortBy(sortBy === 'x' ? 'name' : 'value')
    .valueOf()
}

/**
 * Question: Who are the unique authors in a project ?
 * find all the unique authors per project
 * @returns [author1, author2, author3]
 */
export function authorsForOneProject(project, organization) {
  return _(project.commits)
    .filter(x => organization ? x.organization === organization : x)
    .map('author').uniq().orderBy().valueOf()
}

/**
 * Question: How many authors per project ?
 * Question: Who are the authors for EVERY project ?
 * Question: What is the most active project by authors ?
 * find all the unique authors for EVERY project
 * @returns [{name: aaa, authors: [a1, a2, a3]}, {name: affinity, authors: [b1, b2, b3, a1]}]
 */
export function authorsForAllProjects(projects, sortBy = 'x') {
  return _(projects)
    .map(x => { return {name: x.name, authors: authorsForOneProject(x)} } )
    .sortBy(sortBy === 'x' ? 'name' : 'authors')
    .valueOf()
}

/**
 * Question: How many authors per project for all projects?
 * @returns [{name: aaa, authorCount: 30}, {name: affinity, authorCount: 45}]
 */
export function authorCountForAllProjects(projects, sortBy = 'x') {
  return _(authorsForAllProjects(projects))
    .map(x => {return { name: x.name, authorCount: x.authors.length }})
    .sortBy(sortBy === 'x' ? 'name' : 'authorCount')
    .valueOf()
}

/**
 * Question: How many unique authors in total FOR ALL projects ?
 * @returns [author11, author12, author21, author22, author31 ]
 */
export function uniqueAuthorsForAllProjects(projects, organization) {
  return _(projects)
    .map(x => { return authorsForOneProject(x, organization)} )
    .flatten().uniq().orderBy().valueOf()
}

/**
 * Question: How many times authors have committed FOR ONE project
 * find how many times authors have committed per project
 * @returns [{name: author1, commitCount: 20}, {name: author2, commitCount: 35}]
 */
export function authorsVsCommitsForOneProject(project) {
  return _(project.commits)
    .map('author')
    .orderBy().countBy()
    .map((v,k) => { return { name: k, commitCount: v}})
    .valueOf()
}

/**
 * Question: How many times authors have committed FOR ALL projects
 * find how many times authors have committed per project
 * @returns { author1: 20, author2: 25, author3:12 }
 */
export function authorsVsCommitsForAllProjects(projects) {
  return _.map(projects, x => {
    return _(x.commits).map('author').orderBy().countBy().valueOf()
  })
}

/**
 * Question: How much LOCs did authors contribute for ONE project ?
 * Question: Who is the Top-Most author for ONE Project ?
 * collects lines of code by author per project
 */
export function authorsVsLocForOneProject(project, sortBy = 'x') {
  let m = _(project.commits).map(c => {
    return {
      name: c.author,
      lines: c.insertions + c.deletions
    }
  })
  .groupBy('name')
  .reduce( (result, value, key) => {
    let loc = _.reduce(value, (r, v) => { return r + v.lines} , 0)
    result.push( {name: key, loc: loc} )
    return result
  }, [])
  .valueOf()

  // return _.orderBy(m, (sortBy === 'x' ? ['name'] : ['loc']), ['desc'])
  return _.sortBy(m, sortBy === 'x' ? 'name' : 'loc')
}

/**
 * Question: How much LOC did an author contribute for ALL Projects ?
 * Question: Who is the Top-Most author of ALL Projects ?
 * collects lines of code by author per project
 */
export function authorsVsLocForAllProjects(projects, sortBy = 'x') {
  return _(projects).map(p => {
    return authorsVsLocForOneProject(p)
  })
  .flatten()
  .groupBy('name')
  .map((value, key) => {
    return { name: key, loc: _.sumBy(value, 'loc')}
  })
  .orderBy((sortBy === 'x' ? ['name'] : ['loc']), ['desc'])
  .valueOf()
}

/**
 * Question: Who did what most ? Who did what second most ?
 * Question: Who did what least ? Who did what second least ?
 * Eg: Who committed most?
 * return most: { author1: 60 }, secondMost: { author2 : 40 }, least: {author3: 5}, secondLeast: {author4: 10} ]
 */
export function mostAndLeast(array, key) {
  //find the object with maximum value
  const most1 = _.maxBy(array, key)
  const most2 = _.maxBy(_.without(array, most1), key)
  const least1 = _.minBy(array, key)
  const least2 = _.minBy(_.without(array, least1), key)
  return { most1, most2, least1, least2 }
}

export function commitStats(project) {
  if (_.isEmpty(project.commits)) return {}

  const firstCommit = moment(project.commits[0].authored_date*1000).format('DD-MMM-YYYY')
  const firstCommitter = project.commits[0].author
  const lastCommit = moment(project.commits[project.commits.length-1].authored_date*1000).format('DD-MMM-YYYY')
  const lastCommitter = project.commits[project.commits.length-1].author

  return { firstCommit, firstCommitter, lastCommit, lastCommitter}
}

/**
 * Question: Who are the unique authors in a project ?
 * find all the unique authors per project
 */
export function organizationsForOneProject(project) {
  return _(project.commits).map('organization').uniq().orderBy().valueOf()
}

/**
 * Question: How many in total organizations have contributed FOR ALL projects ?
 * Question: Who are all the organizations for all projects ?
 * find all the unique authors for ALL projects
 */
export function uniqueOrganizationsForAllProjects(projects) {
  return _(projects)
    .map(x => { return organizationsForOneProject(x)} )
    .flatten().uniq().orderBy().valueOf()
}

/**
 * Question: How many organizations per project ?
 * Question: Who are the organizations for EVERY project ?
 * Question: What is the most active project by organizations ?
 */
export function organizationsForAllProjects(projects, sortBy = 'x') {
  return _(projects)
    .map(x => { return {name: x.name, organizations: organizationsForOneProject(x)} } )
    .sortBy(sortBy === 'x' ? 'name' : 'organizations')
    .valueOf()
}

/**
 * Question: How many organizations are contributing for EACH project ?
 * @returns [{name: aaa, organizationCount: 5}, {name: controller, organizationCount:10 }]
 */
export function organizationCountForAllProjects(projects, sortBy='x') {
  return _(organizationsForAllProjects(projects))
    .map(x => {return { name: x.name, organizationCount: x.organizations ? x.organizations.length : 0}})
    .sortBy(sortBy === 'x' ? 'name' : 'organizationCount')
    .valueOf()
}

/**
 * Question: How many commits per project by an organizations ?
 * collects commit count from all projects
 * returns [ {name: 'linuxfoundation.org', commits: 79} , {name:'huawei.com', commits: 3} ]
 */
export function organizationsVsCommitsForOneProject(project, organization, sortBy='x') {
  const commitsPerOrg = _(project.commits)
    .filter(x => organization ? x.organization === organization : x)
    .map('organization').orderBy().countBy()
    .reduce( (r,v,k) => {
      r[k] = (r[k] || 0) + v
      return r
    }, {})

  return _(commitsPerOrg)
            .map((v,k) => { return { name: k, commits: v} })
            .sortBy(sortBy === 'x' ? 'name' : 'commits')
            .valueOf()
}

/**
 * Question: How many commits for EACH Projects by ALL organizations ?
 * collects commit count from all projects
 */
export function organizationsVsCommitsForAllProjects(projects, organization, sortBy='x') {
  let allCommitsPerOrg = _(projects)
    .map(p => { return organizationsVsCommitsForOneProject(p)})
    .flatten()
    .reduce((r,x) => {
      r[x.name] = (r[x.name] || 0) + x.commits
      return r
    }, {})

  allCommitsPerOrg = _(allCommitsPerOrg)
    .map((v,k) => { return { name: k, commits: v} })
    .sortBy(sortBy === 'x' ? 'name' : 'commits')
    .valueOf()

  return allCommitsPerOrg
}

/**
 * Question: How did organization X contribute for EACH Project
 */
export function organizationVsCommitsForAllProjects(projects, organization, sortBy = 'x') {
  const commitsPerOrg = _(projects)
    .map(x => organizationsVsCommitsForOneProject(x, organization))
    .reject(_.isEmpty)
    .flatten()
    .sortBy(sortBy === 'x' ? 'name' : 'commits')
    .valueOf()

  return commitsPerOrg
}

/**
 * Question: How much LOCs did an organization contribute for ONE project ?
 * Question: Who is the Top-Most author for ONE Project ?
 * collects lines of code by author per project
 */
export function organizationsVsLocForOneProject(project, organization, sortBy='x') {
  return _(project.commits)
    .filter(x => organization ? x.organization === organization : x)
    .map(c => { return { name: c.organization, loc: (c.insertions - c.deletions) } })
    .groupBy('name')
    .reduce( (result, value, key) => {
      result.push( {name: key, loc: _.sumBy(value, 'loc')} )
      return result
    }, [])
    .valueOf()
}

/**
 * Question: How much LOC did an organization contribute for ALL Projects ?
 * Question: Who is the Top-Most author of ALL Projects ?
 * collects lines of code by author per project
 */
export function organizationsVsLocForAllProjects(projects, organization, sortBy='x') {
  return _(projects).map(p => {
    return organizationsVsLocForOneProject(p, organization)
  })
  .flatten()
  .groupBy('name')
  .map((value, key) => {
    return { name: key, loc: _.sumBy(value, 'loc')}
  })
  .sortBy(sortBy === 'x' ? 'name' : 'loc')
  .valueOf()
}

/**
 * Question: How did organization X contribute for EACH Project by Lines of Code
 */
export function organizationVsLocForAllProjects(projects, organization, sortBy = 'x') {
  const locPerOrg = _(projects)
    .map(x => organizationsVsLocForOneProject(x, organization))
    .reject(_.isEmpty)
    .flatten()
    .sortBy(sortBy === 'x' ? 'name' : 'loc')
    .valueOf()

  return locPerOrg
}

/**
 * Question: How did authors did an organization contribute?
 */
export function organizationsVsAuthorsForOneProject(project) {
  return _(project.commits)
          .uniqBy('author')
          .countBy('organization')
          .valueOf()
}

/**
 * Question: How did authors did an organization contribute?
 */
export function organizationsVsAuthorsForAllProjects(projects) {
  const result = {}
  _.each(projects, x => {
    const b0 = organizationsVsAuthorsForOneProject(x)
    _.mergeWith(result, b0, (o, s) => { return (o||0) + (s||0) })
  })

  return _.map(result, (v,k) => { return { name: k, authorCount: v } })
}
