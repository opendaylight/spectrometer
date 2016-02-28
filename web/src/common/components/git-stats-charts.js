import React, { PropTypes, Component } from 'react';
import _ from 'lodash'
import moment from 'moment'
import { VictoryBar } from 'victory'

const committedLocByMonth = function(data) {
  let m = _(data).map(c => {
    let k = moment(c.time, "DD MMM YYYY HH:mm")
    return {
      x: moment(k).format('MMM')+'-'+k.year(),
      y: c.lines.lines
    }
  })
  .groupBy('x')
  .reduce( (result, value, key) => {
    let loc = _.reduce(value, (r, v) => { return r + v.y} , 0)
    result.push( {x: key, y: loc, label: `${key} (${loc})`})
    return result
  }, [])

  // console.log(m)
  return m
}

const committedLocByAuthor = function(data) {
  let m = _(data).map(c => {
    let k = moment(c.time, "DD MMM YYYY HH:mm")
    return {
      x: c.commiter,
      y: c.lines.lines
    }
  })
  .groupBy('x')
  .reduce( (result, value, key) => {
    let loc = _.reduce(value, (r, v) => { return r + v.y} , 0)
    result.push( {x: key, y: loc, label: `${key} (${loc})`})
    return result
  }, [])

  // console.log(m)
  return m
}

export default class GitStatsCharts extends Component {

  render () {
    const data1 = committedLocByMonth(this.props.gitCommits);
    const data2 = committedLocByAuthor(this.props.gitCommits);
    const lastCommitRelative = moment(this.props.gitCommits[0].time, "DD MMM YYYY HH:mm").fromNow()
    const heightScale = 25;
    return (
      <div>
        <h3>Summary</h3>
        {
          this.props.gitCommits && (this.props.gitCommits.length > 0) && (
            <div>
              <div><strong>Total Commits: </strong>{this.props.gitCommits.length}</div>
              <div><strong>Total Authors: </strong>{data2.length}</div>
              <div><strong>Last Committer: </strong>{this.props.gitCommits[0].commiter} on {this.props.gitCommits[0].time}<span style={{color: 'grey'}}> ({lastCommitRelative})</span></div>
            </div>
          )
        }
        <div>
            <h3>Committed Lines of Code by Month</h3>
            <VictoryBar horizontal height={data1.length*heightScale} width={1280} data={data1} />
        </div>
        <div>
            <h3>Committed Lines of Code by Author</h3>
            <VictoryBar horizontal height={data2.length*heightScale} width={1280} data={data2} />
        </div>
      </div>
    );
  }
}

GitStatsCharts.propTypes = {
  gitCommits: PropTypes.array.isRequired
};
