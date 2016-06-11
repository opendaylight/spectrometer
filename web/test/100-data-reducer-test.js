import chai, {expect} from 'chai';
chai.use(require('chai-fuzzy'));

import * as DataReducers from '../src/server/api/data-reducers';

describe('data reducers suite:', function(){

  before('setup fixtures', function() {
    const c0 =
    this.projects = [
      { name: 'spectrometer', commits: require('./fixtures/commits-spectrometer').commits },
      { name: 'aaa', commits: require('./fixtures/commits-aaa').commits },
      { name: 'integration', commits: require('./fixtures/commits-integration').commits },
    ]
  });

  it('should determine how many times authors have committed to a project', function() {
    const actual = DataReducers.authorCommitFrequencyPerProject(this.projects[0])
    console.json("authorCommitFrequencyPerProject:", actual)
    const expected = {
      "A H": 3,
      "Andrew Grimberg": 1,
      "Mohammad Hassan Zahraee": 22,
      "Thanh Ha": 78,
      "Vasu": 2
    }
    expect(actual).to.be.like(expected)
  })

  it('should determine unique authors from commits for all projects', function() {
    const actual = DataReducers.uniqueAuthorsForAllProjects(this.projects)
    // console.json("uniqueAuthorsForAllProjects:", actual)
    const expected = require('./fixtures/expected-authors-all.json')
    expect(actual).to.have.length(expected.length)
    expect(actual).to.be.like(expected)
  });

  it('should determine unique authors from commits for a single project', function() {
    const actual = DataReducers.uniqueAuthorsPerProject(this.projects[0])
    // console.json("uniqueAuthorsPerProject:", actual)
    const expected = [
      "A H",
      "Andrew Grimberg",
      "Mohammad Hassan Zahraee",
      "Thanh Ha",
      "Vasu"
    ]
    expect(actual).to.have.length(expected.length)
    expect(actual).to.be.like(expected)
  });

  it('should create a data series of all projects vs commits', function() {
    const actual = DataReducers.projectsVsCommits(this.projects)
    // console.json("projectsVsCommitsCount:", actual)
    const expected = [
      { name: 'spectrometer', value: 106 },
      { name: 'aaa', value: 433 },
      { name: 'integration', value: 1193 }
    ]
    expect(actual).to.be.like(expected)
  })

  it('should create a data series of authors vs loc for all projects', function() {
    const actual = DataReducers.authorsVsLocForAllProjects(this.projects)
    // console.json("authorsVsLocForAllProjects:", actual)
    const expected = require('./fixtures/expected-authors-loc-all')
    expect(actual).to.be.like(expected)
  })

  it('should create a data series of authors vs loc for a single project', function() {
    const actual = DataReducers.authorsVsLoc(this.projects[0])
    // console.json("authorsVsLoc:", actual)
    const expected = [
      { "name": "Thanh Ha", "loc": 5171 },
      { "name": "Mohammad Hassan Zahraee", "loc": 3621 },
      { "name": "Vasu", "loc": 2716 },
      { "name": "A H", "loc": 197 },
      { "name": "Andrew Grimberg", "loc": 0 }
    ]
    expect(actual).to.be.like(expected)
  });

  it('should create a data series of projects vs authors', function() {
    const actual = DataReducers.projectsVsAuthors(this.projects)
    // console.json("projectsVsAuthors:", actual)
    const expected = require('./fixtures/expected-projects-vs-authors.json')
    expect(actual).to.be.like(expected)
  });

  it('should create a data series of projects vs authors count', function() {
    const actual = DataReducers.projectsVsAuthorsCount(this.projects)
    // console.json("projectsVsAuthorsCount:", actual)
    const expected = [
      { "name": "spectrometer", "authorCount": 5},
      { "name": "aaa", "authorCount": 36},
      { "name": "integration", "authorCount": 123}
    ]
    expect(actual).to.be.like(expected)
  });

  it('should create a data series of month vs loc for a single project', function() {
    const actual = DataReducers.timeVsLoc(this.projects[0])
    // console.json("timeVsLoc:", actual)
    const expected = [
      { "name": "Feb-2016", "loc": 5065 },
      { "name": "Apr-2016", "loc": 4741 },
      { "name": "Dec-2015", "loc": 1108 },
      { "name": "May-2016", "loc": 786 },
      { "name": "Nov-2015", "loc": 5 }
    ]

    expect(actual).to.be.like(expected)
  });

  it('timeVsCommitsLocDetails: should reduce commits of a single project by timeline vs inserts and deletes', function() {
    const actual = DataReducers.timeVsLocDetails(this.projects[0])
    // console.json("timeVsLocDetails:", actual)
    const expected = [
      { "name": "May-2016", "insertions": 368, "deletions": 418, "files": 34 },
      { "name": "Apr-2016", "insertions": 3239, "deletions": 1502, "files": 147 },
      { "name": "Feb-2016", "insertions": 3969, "deletions": 1096, "files": 170 },
      { "name": "Dec-2015", "insertions": 814, "deletions": 294, "files": 77 },
      { "name": "Nov-2015", "insertions": 5, "deletions": 0, "files": 1 }
    ]

    expect(actual).to.be.like(expected)
  });
});
