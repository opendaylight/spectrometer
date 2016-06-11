import React, { Component } from 'react';

import ReactHighcharts from 'react-highcharts'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'

const buttonActions = [
  {type: 'chartType', option: 'column', icon: 'insert_chart', tooltip: 'Show as Bar Chart'},
  {type: 'chartType', option: 'line', icon: 'multiline_chart', tooltip: 'Show as Line chart'}
]

export default class TimeVsCommitsChart extends Component {

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
        xAxis: { title: { text: 'Time'  }, categories: _.map(dataSeries, "time") },
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

    const renderLineChart = (dataSeries) => {
      const config = {
        chart: { type: 'line' },
        title: { text: '' },
        xAxis: { title: { text: 'Time'  }, categories: _.map(dataSeries, "time") },
        yAxis: { title: { text: 'Commits' }},
        series: [{ name: 'LOC', data: _.map(dataSeries, "commitCount") }],
        tooltip: {
          pointFormat: '{series.time}: {point.y}'
        },
        plotOptions: {
          line: {
            allowPointSelect: true, cursor: 'pointer',
            dataLabels: { enabled: true },
            enableMouseTracking: false
          }
        }
      }
      return (
        <ReactHighcharts config={config} />
      )
    }

    if (_.isEmpty(this.props.project)) return null;

    const dataSeries = DataReducers.timeVsCommitsForOneProject(this.props.project)
    console.info("TimeVsCommitsChart:", JSON.stringify(dataSeries, undefined, 2))

    return (
      <PaperLayout id="time-vs-loc-chart" title="No. of Commits by Timeline"
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        {this.state.view.chartType === 'column' && renderColumnChart(dataSeries)}
        {this.state.view.chartType === 'line' && renderLineChart(dataSeries)}
      </PaperLayout>
    )
  }
}

TimeVsCommitsChart.propTypes = {
  project: React.PropTypes.object
}
