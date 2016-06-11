import React, { Component } from 'react';

import ReactHighcharts from 'react-highcharts'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'

const buttonActions = [
  {type: 'chartType', option: 'column', icon: 'insert_chart', tooltip: 'Show as Column Chart'},
  {type: 'chartType', option: 'pie', icon: 'pie_chart_outlined', tooltip: 'Show as Pie Chart'},
  {type: 'sortBy', option: 'x', icon: 'sort_by_alpha', tooltip: 'Sort by Project', group: true},
  {type: 'sortBy', option: 'y', icon: 'sort', tooltip: 'Sort by Commits'}
]

export default class ProjectsVsLocChart extends Component {

  constructor(props) {
    super(props)
    this.state = {
      view: {
        chartType: 'column',
        sortBy: 'x'
      }
    }
  }

  handleButtonActions = (type, value) => {
    const newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    const renderColumnChart = (dataSeries) => {
      const config = {
        chart: { type: 'column' },
        title: { text: ''},
        xAxis: { title: { text: 'Projects'  }, categories: _.map(dataSeries, "name"), crosshair: true },
        yAxis: { title: { text: 'LOC' }},
        series: [{ name: 'LOC', colorByPoint: true, data: _.map(dataSeries, "value") }],
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
          data: _.map(dataSeries, (x) => { return {name: x.name, y: x.value} })
        }]
      }
      return (
        <ReactHighcharts config={config} />
      )
    }

    if (_.isEmpty(this.props.projects)) return null

    let dataSeries = []
    if (!_.isEmpty(this.props.organization)) {
      dataSeries = DataReducers.locForAllProjects(DataReducers.projectsContainingOrganization(this.props.projects, this.props.organization), this.state.view.sortBy)
    } else {
      dataSeries = DataReducers.locForAllProjects(this.props.projects, this.state.view.sortBy)
    }
    console.log("projects-vs-loc-chart:render", this.props.organization, this.props.author)

    return (
      <PaperLayout id="projects-vs-loc" zDepth={2} title="Lines of Code across projects"
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        {this.state.view.chartType === 'column' && renderColumnChart(dataSeries)}
        {this.state.view.chartType === 'pie' && renderPieChart(dataSeries)}
      </PaperLayout>
    )
  }
}

ProjectsVsLocChart.propTypes = {
  projects: React.PropTypes.array,
  organization: React.PropTypes.string
}
