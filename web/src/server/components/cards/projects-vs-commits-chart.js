import React, { Component } from 'react';

import ReactHighcharts from 'react-highcharts'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'

const buttonActions = [
  {type: 'chartType', option: 'column', icon: 'insert_chart', tooltip: 'Show as Column Chart'},
  {type: 'chartType', option: 'pie', icon: 'pie_chart_outlined', tooltip: 'Show as Pie Chart'},
  {type: 'sortBy', option: 'x', icon: 'sort_by_alpha', tooltip: 'Sort by Project', group: true},
  {type: 'sortBy', option: 'y', icon: 'sort', tooltip: 'Sort by Commits'},
  {type: 'query', option: 'skew-most', icon: 'skip_next', tooltip: 'Skew Most', group: true},
  {type: 'query', option: 'all', icon: 'reorder', tooltip: 'Show All'},
  {type: 'query', option: 'skew-least', icon: 'skip_previous', tooltip: 'Skew Least'}
]

export default class ProjectsVsCommitsChart extends Component {

  constructor(props) {
    super(props)
    this.state = {
      view: {
        chartType: 'column',
        sortBy: 'x',
        query: 'all',
        skewLeast: 0,
        skewMost: 0
      }
    }
  }

  handleButtonActions = (type, value) => {
    let skewLeast = this.state.view.skewLeast
    let skewMost = this.state.view.skewMost
    if (type === 'query' && value === 'skew-least') skewLeast++
    if (type === 'query' && value === 'skew-most') skewMost++
    if (type === 'query' && value === 'all') skewLeast = skewMost = 0
    const newView = _.merge(this.state.view, {[type]: value, skewLeast, skewMost })
    this.setState({ view: newView })
  }

  render() {
    const renderColumnChart = (dataSeries) => {
      const config = {
        chart: { type: 'column' },
        title: { text: ''},
        xAxis: { title: { text: 'Projects'  }, categories: _.map(dataSeries, "name"), crosshair: true },
        yAxis: { title: { text: 'Commits' }},
        series: [{ name: 'Commits', colorByPoint: true, data: _.map(dataSeries, "commitCount") }],
        plotOptions: {
          column: {
            showInLegend: false
          }
        }
      }
      return (
        <ReactHighcharts config={config} />
      )
    }

    const renderPieChart = (dataSeries) => {
      const config = {
        chart: { type: 'pie' },
        title: { text: '' },
        tooltip: {
          pointFormat: '{series.name}: {point.y}'
        },
        plotOptions: {
          pie: {
            allowPointSelect: true, cursor: 'pointer',
            dataLabels: {
              enabled: true, color: 'black',
              formatter: function() { return this.point.name + ' ' + this.point.y + ' (' + (Math.round(this.percentage*100)/100 + ' %)') }
            }
          }
        },
        series: [{
          name: 'Commits',
          colorByPoint: true,
          data: _.map(dataSeries, (x) => { return {name: x.name, y: x.commitCount} })
        }]
      }
      return (
        <ReactHighcharts config={config} />
      )
    }

    if (_.isEmpty(this.props.projects)) return null

    let dataSeries = []
    if (!_.isEmpty(this.props.organization)) {
      dataSeries = DataReducers.commitCountForAllProjects(DataReducers.projectsContainingOrganization(this.props.projects, this.props.organization), this.state.view.sortBy)
    } else {
      dataSeries = DataReducers.commitCountForAllProjects(this.props.projects, this.state.view.sortBy)
    }

    if (this.state.view.skewLeast) {
      dataSeries = _.reject(dataSeries, x => x.commitCount < this.state.view.skewLeast * 10)
    }
    _.times(this.state.view.skewMost, t => {
      dataSeries = _.reject(dataSeries, x => x === _.maxBy(dataSeries, 'commitCount'))
    })
    console.log("projects-vs-commits-chart:render", this.props.organization, this.props.author)

    return (
      <PaperLayout id="projects-vs-commits" zDepth={2} title="Commits across projects"
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        {this.state.view.chartType === 'column' && renderColumnChart(dataSeries)}
        {this.state.view.chartType === 'pie' && renderPieChart(dataSeries)}
      </PaperLayout>
    )
  }
}

ProjectsVsCommitsChart.propTypes = {
  projects: React.PropTypes.array,
  organization: React.PropTypes.string
}
