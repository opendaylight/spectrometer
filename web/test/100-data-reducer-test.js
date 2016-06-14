import _ from 'lodash'

import chai, {expect} from 'chai'
chai.use(require('chai-fuzzy'));

import * as DataReducers from '../src/server/api/data-reducers';

describe('data reducers suite:', function(){

  before('setup fixtures', () => {
    //this is what python api gives to ui
    this.apiProjects = [
      { name: 'aaa', commits: require('./fixtures/commits-aaa').commits },
      { name: 'spectrometer', commits: require('./fixtures/commits-spectrometer').commits }
    ]
    //simulate the axios returned data so subsequent tests can work on the ui data format
    this.apiResponse = _.map(this.apiProjects, x => {
      return {
        config: { url: `http://localhost/git/commits?project=${x.name}`},
        data: { commits: x.commits }
      }
    })
    //converted to ui format consumption
    //result is sorted by time ascending, so should NOT be same as old, if this fails it means API has changed
    //result: {name: spectrometer, ref1: master, ref2: master, commits: [...]}
    this.projects = DataReducers.mapProjects(this.apiResponse)
  })

  it('should verify that project commits are sorted in ascending and not contain commit messages', () => {
    //pick spectrometer to verify
    const given = this.apiProjects[1]
    expect(given.commits[0]).to.be.like({
      "author": "Thanh Ha",
      "author_email": "thanh.ha@linuxfoundation.org",
      "author_tz_offset": 14400,
      "authored_date": 1462661049,
      "committed_date": 1462661113,
      "committer": "Thanh Ha",
      "committer_email": "thanh.ha@linuxfoundation.org",
      "committer_tz_offset": 14400,
      "hash": "0dfa62e4d2ae3b372c40471a3779a81513df3467",
      "lines": {
        "deletions": 3,
        "files": 1,
        "insertions": 3,
        "lines": 6
      },
      "message": "Switch to using str.format()\n\nUsing the str.format() is a bit nicer and generally recommended in\npython.\n\nChange-Id: I011d109bd18ece80c02d9e9aca6778c7d89dcf4b\nSigned-off-by: Thanh Ha <thanh.ha@linuxfoundation.org>\n"
    })

    const project = this.projects[1]
    expect(project.name).to.equal('spectrometer')
    expect(project.ref1).to.equal('master')
    expect(project.ref2).to.equal('master')
    expect(project.commits[0]).to.be.like({
      "author": "Andrew Grimberg",
      "author_email": "agrimberg@linuxfoundation.org",
      "author_tz_offset": 0,
      "authored_date": 1447957557,
      "insertions": 0,
      "deletions": 0,
      "files": 0,
      "organization": "linuxfoundation.org"
    })
  })

  it('should map timelineForAllProjects', () => {
    const result = DataReducers.timelineForAllProjects(this.projects)
    // console.json("timelineForAllProjects", result)
    expect(result).to.be.like([
      {
        "name": "aaa",
        "firstCommit": 1400610058,
        "lastCommit": 1462562634
      },
      {
        "name": "spectrometer",
        "firstCommit": 1447957557,
        "lastCommit": 1462661049
      }
    ])
    expect(DataReducers.toMonthYearFormat(result[0].firstCommit)).to.equal('May-2014')
    expect(DataReducers.toMonthYearFormat(result[0].lastCommit)).to.equal('May-2016')
  })

  it('should calculate timeVsCommitsForOneProject', () => {
    const result = DataReducers.timeVsCommitsForOneProject(this.projects[0])
    // console.json("timeVsCommitsForOneProject", result)
    expect(result).to.have.length(25)
    expect(result[0]).to.be.like({
      "time": "May-2014",
      "commitCount": 1
    })
    expect(result[24]).to.be.like({
      "time": "May-2016",
      "commitCount": 7
    })
  })

  it('should calculate timeVsLocForOneProject', () => {
    const result = DataReducers.timeVsLocForOneProject(this.projects[0])
    // console.json("timeVsLocForOneProject", result)
    expect(result).to.have.length(25)
    expect(result[0]).to.be.like({
      "time": "May-2014",
      "loc": 0
    })
    expect(result[24]).to.be.like({
      "time": "May-2016",
      "loc": 760
    })
  })

  it('should calculate timeVsLocDetailsForOneProject', () => {
    const result = DataReducers.timeVsLocDetailsForOneProject(this.projects[0])
    // console.json("timeVsLocDetailsForOneProject", result)
    expect(result).to.have.length(25)
    expect(result[0]).to.be.like({
      "time": "May-2014",
      "insertions": 0,
      "deletions": 0,
      "files": 0
    })
    expect(result[24]).to.be.like({
      "time": "May-2016",
      "insertions": 274,
      "deletions": 486,
      "files": 28
    })
  })

  it('should calculate commitCountForAllProjects and sort by name', () => {
    const result = DataReducers.commitCountForAllProjects(this.projects)
    // console.json("commitCountForAllProjects", result)
    expect(result).to.have.length(2)
    expect(result).to.be.like([
      { "name": "aaa", "commitCount": 433 },
      { "name": "spectrometer", "commitCount": 106 }
    ])
  })

  it('should calculate commitCountForAllProjects and sort by commitCount', () => {
    const result = DataReducers.commitCountForAllProjects(this.projects, 'y')
    // console.json("commitCountForAllProjects", result)
    expect(result).to.have.length(2)
    expect(result).to.be.like([
      { "name": "spectrometer", "commitCount": 106 },
      { "name": "aaa", "commitCount": 433 }
    ])
  })

  it('should calculate commitCountForAllProjectsPerOrg', () => {
    const result = DataReducers.commitCountForAllProjectsPerOrg(this.projects, "linuxfoundation.org")
    // console.json("commitCountForAllProjectsPerOrg", result)
    expect(result).to.have.length(2)
    expect(result).to.be.like([
      { "name": "aaa", "commitCount": 30 },
      { "name": "spectrometer", "commitCount": 79 }
    ])
  })

  it('should calculate commitCountForAllProjectsPerAuthor', () => {
    const result = DataReducers.commitCountForAllProjectsPerAuthor(this.projects, "Thanh Ha")
    // console.json("commitCountForAllProjectsPerAuthor", result)
    // TODO interesting stats here: commitCountForAllProjectsPerAuthor / commitCountForAllProjectsPerOrg *100% gives how much % an author has contributed within an org
    expect(result).to.have.length(2)
    expect(result).to.be.like([
      { "name": "aaa", "commitCount": 29 },
      { "name": "spectrometer", "commitCount": 78 } ])
  })

  it('should find projectsContainingOrganization', () => {
    //picking org that contributions to only one of the test projects
    const result = DataReducers.projectsContainingOrganization(this.projects, "cisco.com")
    // console.json("projectsContainingOrganization", result)
    expect(result).to.have.length(1) //verify org contributed to only one of the projects
    expect(result[0].commits).to.have.length(433) // verify project commits have not been altered, only returns those projects E org
    //boundary case tests
    expect(DataReducers.projectsContainingOrganization(this.projects, "gmail.com")).to.have.length(2)
    expect(DataReducers.projectsContainingOrganization(this.projects, "noorg.org")).to.have.length(0)
  })

  it('should find projectsContainingAuthor', () => {
    //picking author that contributions to only one of the test projects
    const result = DataReducers.projectsContainingAuthor(this.projects, "Mohammad Hassan Zahraee")
    // console.json("projectsContainingOrganization", result)
    expect(result).to.have.length(1) //verify org contributed to only one of the projects
    expect(result[0].commits).to.have.length(106) // verify project commits have not been altered, only returns those projects E org
    //boundary case tests
    expect(DataReducers.projectsContainingAuthor(this.projects, "Thanh Ha")).to.have.length(2)
    expect(DataReducers.projectsContainingAuthor(this.projects, "Nobody")).to.have.length(0)
  })

  it('should calculate locForAllProjects', () => {
    const result = DataReducers.locForAllProjects(this.projects)
    // console.json("locForAllProjects", result)
    expect(result).to.have.length(2)
    expect(result).to.be.like([
      { "name": "aaa", "value": 52579 },
      { "name": "spectrometer", "value": 5085 }
    ])
  })

  it('should calculate locForAllProjectsPerOrg', () => {
    const result = DataReducers.locForAllProjectsPerOrg(this.projects, "cisco.com")
    // console.json("locForAllProjectsPerOrg", result)
    expect(result).to.have.length(2)
    expect(result).to.be.like([
      { "name": "aaa", "value": 12773 },
      { "name": "spectrometer", "value": 0 }
    ])
  })

  it('should calculate locForAllProjectsPerAuthor', () => {
    const result = DataReducers.locForAllProjectsPerAuthor(this.projects, "Ryan Goulding")
    // console.json("locForAllProjectsPerAuthor", result)
    expect(result).to.have.length(2)
    expect(result).to.be.like([
      { "name": "aaa", "value": 9559 },
      { "name": "spectrometer", "value": 0 }
    ])
  })

  it('should find authorsForAllProjects', () => {
    const result = DataReducers.authorsForAllProjects(this.projects)
    // console.json("authorsForAllProjects", result)
    expect(result).to.have.length(2) //verify both projects returned
    expect(result[0].name).to.equal('aaa') //verify project name is sorted alpha
    expect(result[0].authors).to.have.length(36)
    expect(result[1].authors).to.be.like(_.sortBy(result[1].authors)) //verify authors sorted alpha
    expect(result[1].authors).to.be.like(_.uniq(result[1].authors)) //verify unique authors returned
  })

  it('should calculate authorCountForAllProjects', () => {
    const result = DataReducers.authorCountForAllProjects(this.projects)
    // console.json("authorCountForAllProjects", result)
    expect(result).to.have.length(2) //verify both projects returned
    expect(result).to.be.like([
      { "name": "aaa", "authorCount": 36 },
      { "name": "spectrometer", "authorCount": 5 }
    ])
  })

  it('should find unqiueAuthorsForAllProjects', () => {
    const result1 = DataReducers.uniqueAuthorsForAllProjects(this.projects)
    // console.json("unqiueAuthorsForAllProjects", result1)
    expect(result1).to.have.length(40)
    expect(result1).to.be.like(_.uniq(result1)) //must be unique authors
    expect(result1).to.be.like(_.sortBy(result1)) //must be sorted alpha

    //unique authors for all projects from a particular organization
    const result2 = DataReducers.uniqueAuthorsForAllProjects(this.projects, "gmail.com")
    expect(result2).to.be.like(["Ryan Goulding", "Sharon Aicler", "Vasu"])
    expect(result1.length).to.not.equal(result2.length)
  })

  it('should calculate authorsVsCommitsForOneProject', () => {
    //TODO missing sort feature
    const result = DataReducers.authorsVsCommitsForOneProject(this.projects.find(x => x.name === 'spectrometer'))
    // console.json("authorsVsCommitsForOneProject", result)
    expect(result).to.have.length(5)
    expect(result).to.be.like([
      { "name": "A H", "commitCount": 3 },
      { "name": "Andrew Grimberg", "commitCount": 1 },
      { "name": "Mohammad Hassan Zahraee", "commitCount": 22 },
      { "name": "Thanh Ha", "commitCount": 78 },
      { "name": "Vasu", "commitCount": 2 }
    ])
  })

  it('should calculate authorsVsCommitsForAllProjects', () => {
    //TODO missing sort feature
    const result = DataReducers.authorsVsCommitsForAllProjects(this.projects)
    // console.json("authorsVsCommitsForAllProjects", result)

    expect(result).to.have.length(40)
    const result2 = DataReducers.uniqueAuthorsForAllProjects(this.projects)
    //verify same as unique authors length
    expect(result.length).to.equal(result2.length)

    //verify commitCount adds up correctly
    const a0 = result.find(x => x.name === 'Thanh Ha')
    expect(a0.commitCount).to.equal(107)
    const a1 = DataReducers.authorsVsCommitsForOneProject(this.projects.find(x => x.name === 'spectrometer')).find(x => x.name === 'Thanh Ha')
    const a2 = DataReducers.authorsVsCommitsForOneProject(this.projects.find(x => x.name === 'aaa')).find(x => x.name === 'Thanh Ha')
    expect(a0.commitCount).to.be.equal(a1.commitCount + a2.commitCount)
  })

  it('should calculate authorsVsLocForOneProject', () => {
    //TODO missing sort feature
    const result = DataReducers.authorsVsLocForOneProject(this.projects.find(x => x.name === 'spectrometer'))
    // console.json("authorsVsLocForOneProject", result)
    expect(result).to.have.length(5)
    expect(result).to.be.like([
      { "name": "A H", "loc": 197 },
      { "name": "Andrew Grimberg", "loc": 0 },
      { "name": "Mohammad Hassan Zahraee", "loc": 3621 },
      { "name": "Thanh Ha", "loc": 5171 },
      { "name": "Vasu", "loc": 2716 }
    ])
  })

  it('should calculate authorsVsLocForAllProjects', () => {
    //TODO missing sort feature
    const result = DataReducers.authorsVsLocForAllProjects(this.projects)
    // console.json("authorsVsCommitsForAllProjects", result)

    expect(result).to.have.length(40)
    const result2 = DataReducers.uniqueAuthorsForAllProjects(this.projects)
    //verify same as unique authors length
    expect(result.length).to.equal(result2.length)

    //verify commitCount adds up correctly
    const a0 = result.find(x => x.name === 'Thanh Ha')
    expect(a0.loc).to.equal(6496)
    const a1 = DataReducers.authorsVsLocForOneProject(this.projects.find(x => x.name === 'spectrometer')).find(x => x.name === 'Thanh Ha')
    const a2 = DataReducers.authorsVsLocForOneProject(this.projects.find(x => x.name === 'aaa')).find(x => x.name === 'Thanh Ha')
    expect(a0.loc).to.be.equal(a1.loc + a2.loc)
  })

  it('should find most and least values of a given collection', () => {
    // const c0 = this.projects.find(x => x.name === 'aaa').commits
    const c0 = [ {name: 'author1', commitCount: 101}, {name: 'author2', commitCount: 10},
                 {name: 'author3', commitCount: 1218}, {name: 'author4', commitCount: 1217},
                 {name: 'author5', commitCount: 130}, {name: 'author6', commitCount: 144},
               ]
    const result = DataReducers.mostAndLeast(c0, 'commitCount')
    expect(result.most1.name).to.equal('author3')
    expect(result.most2.name).to.equal('author4')
    expect(result.least1.name).to.equal('author2')
    expect(result.least2.name).to.equal('author1')
  })

  it('should find first and last commits in given collection', () => {
    const c0 = this.projects.find(x => x.name === 'aaa').commits
    const result = DataReducers.mostAndLeast(c0, 'authored_date')
    expect(result.most1.author).to.equal('Ryan Goulding')
    expect(result.least1.author).to.equal('Aric Gardner')
  })

  it('should find all organizations contributing to a single project', () => {
    const project = this.projects.find(x => x.name === 'aaa')
    const result = DataReducers.organizationsForOneProject(project)
    // console.json('organizationsForOneProject', result)
    expect(result).to.have.length(10)
    expect(result).to.be.like([ "brocade.com", "cisco.com", "colindixon.com", "gmail.com", "hp.com", "huawei.com", "inocybe.com", "linuxfoundation.org", "pantheon.sk", "redhat.com" ])
    expect(result).to.be.like(_.uniq(result))
    expect(result).to.be.like(_.sortBy(result))
  })

  it('should find uniqueOrganizationsForAllProjects', () => {
    const result = DataReducers.uniqueOrganizationsForAllProjects(this.projects)
    // console.json('uniqueOrganizationsForAllProjects', result)
    expect(result).to.have.length(11)
    expect(result).to.be.like([ "brocade.com", "cisco.com", "colindixon.com", "gmail.com", "hp.com", "huawei.com", "inocybe.com", "linuxfoundation.org", "pantheon.sk", "redhat.com", "yahoo.com" ])
    expect(result).to.be.like(_.uniq(result))
    expect(result).to.be.like(_.sortBy(result))
  })

  it('should find organizationsForAllProjects', () => {
    const result = DataReducers.organizationsForAllProjects(this.projects)
    // console.json('organizationsForAllProjects', result)
    expect(result).to.have.length(2)
    expect(result).to.be.like([
      { "name": "aaa", "organizations": [ "brocade.com", "cisco.com", "colindixon.com", "gmail.com", "hp.com", "huawei.com", "inocybe.com", "linuxfoundation.org", "pantheon.sk", "redhat.com" ] },
      { "name": "spectrometer", "organizations": [ "gmail.com", "huawei.com", "linuxfoundation.org", "yahoo.com" ] }
    ])
  })

  it('should find organizationCountForAllProjects', () => {
    const result = DataReducers.organizationCountForAllProjects(this.projects)
    // console.json('organizationCountForAllProjects', result)
    expect(result).to.have.length(2)
    expect(result).to.be.like([
      { "name": "aaa", "organizationCount": 10 },
      { "name": "spectrometer", "organizationCount": 4 }
    ])
  })

  it('should calculate organizationsVsCommitsForOneProject', () => {
    const project = this.projects.find(x => x.name === 'aaa')
    const result = DataReducers.organizationsVsCommitsForOneProject(project, null, 'y')
    // console.json('organizationsVsCommitsForOneProject', result)
    expect(result).to.have.length(10)
    expect(result).to.be.like([
      { "name": "pantheon.sk", "commits": 1 }, { "name": "huawei.com", "commits": 1 }, { "name": "colindixon.com", "commits": 2 },
      { "name": "brocade.com", "commits": 2 }, { "name": "inocybe.com", "commits": 12 }, { "name": "redhat.com", "commits": 17 }, { "name": "linuxfoundation.org", "commits": 30 },
      { "name": "hp.com", "commits": 68 }, { "name": "cisco.com", "commits": 138 }, { "name": "gmail.com", "commits": 162 }])

    const result2 = DataReducers.organizationsVsCommitsForOneProject(project, 'linuxfoundation.org')
    // console.json('organizationsVsCommitsForOneProject for one organization', result2)
    expect(result2).to.have.length(1)
    expect(result2).to.be.like([{ "name": "linuxfoundation.org", "commits": 30 } ])
  })

  it('should calculate organizationsVsCommitsForAllProjects', () => {
    const result = DataReducers.organizationsVsCommitsForAllProjects(this.projects)
    // console.json('organizationsVsCommitsForAllProjects', result)
    expect(result).to.have.length(11)
    expect(result[10]).to.be.like({ "name": "yahoo.com", "commits": 22 })

    const o1 = DataReducers.organizationsVsCommitsForOneProject(this.projects.find(x => x.name === 'aaa'), 'linuxfoundation.org')
    const o2 = DataReducers.organizationsVsCommitsForOneProject(this.projects.find(x => x.name === 'spectrometer'), 'linuxfoundation.org')
    expect(result.find(x => x.name === 'linuxfoundation.org').commits).to.be.equal(o1[0].commits + o2[0].commits)
  })

  it('should calculate organizationsVsLocForOneProject', () => {
    const project = this.projects.find(x => x.name === 'aaa')
    const result = DataReducers.organizationsVsLocForOneProject(project, null, 'y')
    // console.json('organizationsVsCommitsForOneProject', result)
    expect(result).to.have.length(10)
    expect(result).to.be.like([
      { "name": "huawei.com", "loc": -16 }, { "name": "colindixon.com", "loc": 7 }, { "name": "pantheon.sk", "loc": 14 }, { "name": "brocade.com", "loc": 83 },
      { "name": "linuxfoundation.org", "loc": 121 }, { "name": "inocybe.com", "loc": 3240 }, { "name": "redhat.com", "loc": 6880 },
      { "name": "gmail.com", "loc": 9954 }, { "name": "cisco.com", "loc": 12773 }, { "name": "hp.com", "loc": 19523 }
    ])
    const result2 = DataReducers.organizationsVsLocForOneProject(project, 'linuxfoundation.org')
    // console.json('organizationsVsCommitsForOneProject for one organization', result2)
    expect(result2).to.have.length(1)
    expect(result2).to.be.like([{ "name": "linuxfoundation.org", "loc": 121 } ])
  })

  it('should calculate organizationsVsLocForAllProjects', () => {
    const result = DataReducers.organizationsVsLocForAllProjects(this.projects)
    // console.json('organizationsVsCommitsForAllProjects', result)
    expect(result).to.have.length(11)
    expect(result[10]).to.be.like({ "name": "yahoo.com", "loc": 697 })

    const o1 = DataReducers.organizationsVsLocForOneProject(this.projects.find(x => x.name === 'aaa'), 'linuxfoundation.org')
    const o2 = DataReducers.organizationsVsLocForOneProject(this.projects.find(x => x.name === 'spectrometer'), 'linuxfoundation.org')
    expect(result.find(x => x.name === 'linuxfoundation.org').loc).to.be.equal(o1[0].loc + o2[0].loc)
  })

  it('should calculate organizationsVsAuthorCountForOneProject', () => {
    const result = DataReducers.organizationsVsAuthorCountForOneProject(this.projects.find(x => x.name === 'aaa'))
    // console.json('organizationsVsAuthorCountForOneProject', result)
    expect(result).to.be.like([
      { "name": "brocade.com", "authorCount": 2 }, { "name": "cisco.com", "authorCount": 14 }, { "name": "colindixon.com", "authorCount": 1 },
      { "name": "gmail.com", "authorCount": 1 }, { "name": "hp.com", "authorCount": 8 }, { "name": "huawei.com", "authorCount": 1 },
      { "name": "inocybe.com", "authorCount": 4 }, { "name": "linuxfoundation.org", "authorCount": 2 }, { "name": "redhat.com", "authorCount": 3 }
    ])
  })

  it('should calculate organizationsVsAuthorsForOneProject', () => {
    const project = this.projects.find(x => x.name === 'aaa')
    const result = DataReducers.organizationsVsAuthorsForOneProject(project)
    // console.json('organizationsVsAuthorsForOneProject', result)
    expect(result).to.have.length(10)
    expect(result[0]).to.be.like({ "name": "linuxfoundation.org", "authors": [ "Aric Gardner", "Thanh Ha" ] })
    expect(result[3]).to.be.like({ "name": "redhat.com", "authors": [ "John Dennis", "Stephen Kitt", "Jamo Luhrsen" ] })
  })

  it('should calculate organizationsVsAuthorsForAllProjects', () => {
    const result = DataReducers.organizationsVsAuthorsForAllProjects(this.projects)
    // console.json('organizationsVsAuthorsForAllProjects', result)
    expect(result).to.have.length(11)
    expect(result[0]).to.be.like({ "name": "linuxfoundation.org", "authors": [ "Aric Gardner", "Thanh Ha", "Andrew Grimberg" ] })
  })

  it('should calculate organizationsVsAuthorsCountForAllProjects', () => {
    const result = DataReducers.organizationsVsAuthorsCountForAllProjects(this.projects)
    // console.json('organizationsVsAuthorsCountForAllProjects', result)
    expect(result).to.have.length(11)
    expect(result[0].authorCount).to.equal(3)
    expect(result[10]).to.be.like({ "name": "yahoo.com", "authorCount": 1 })
  })

});
