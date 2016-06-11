import axios from 'axios'
import _ from 'lodash'

// const PROJECTS_LIMIT = 82
let projects = []

export function mapProjectCommits(commits) {
  return _(commits).map((c) => {
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
  }).sortBy(y => y.authored_date).valueOf()
}

export function loadProjectNames(url) {
  return new Promise((resolve, reject) => {
    console.info('data-initializer:loadProjectNames', url)
    axios.get(`${url}/gerrit/projects`)
      .then((res) => {
        console.info("data-initializer:loaded ", res.data.projects.length, " project names")
        //const p0 = _(res.data.projects).reject(n => n.indexOf('integration') >= 0 || n.indexOf('controller') >= 0).slice(1,PROJECTS_LIMIT).valueOf()
        resolve(res.data.projects.slice(1))
      })
    })
}

export function loadBranches(url, names) {
  return new Promise((resolve, reject) => {
    console.info('data-initializer:loadBranches start...')
    let urls = _.map(names, (p) => {
      return axios.get(`${url}/git/branches?project=${p}`)
    })
    let projects = []
    axios.all(urls)
      .then((response) => {
        response.forEach(x => {
          projects.push( { name: x.config.url.replace(`${url}/git/branches?project=`,''), branches: x.data.branches })
        })
        console.info("data-initializer:loadBranches complete")
        resolve(projects)
      })
  })
}

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
        response.forEach((x, index) => {
          const key = x.config.url.replace(`${url}/git/commits?project=`,'')
          console.info('data-initializer:loading commits for', index, key)
          projects.push({
            name: key,
            ref1: 'master',
            ref2: 'master',
            commits: mapProjectCommits(x.data.commits || [])
          })
        })
        console.log("data-initializer:loadCommits complete") //, JSON.stringify(projects, undefined, 2))
        resolve(projects)
    })
  })
}
