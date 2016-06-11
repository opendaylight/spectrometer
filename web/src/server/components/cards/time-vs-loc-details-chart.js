import React, { Component } from 'react';

import ReactHighcharts from 'react-highcharts'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'

const buttonActions = [
  {type: 'chartType', option: 'column', icon: 'insert_chart', tooltip: 'Show as Bar Chart'},
  {type: 'chartType', option: 'line', icon: 'multiline_chart', tooltip: 'Show as Line chart'}
]

export default class TimeVsLocDetailsChart extends Component {

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
        yAxis: { title: { text: 'Lines of Code' }},
        series: [
          { name: 'insertions', data: _.map(dataSeries, "insertions") },
          { name: 'deletions', data: _.map(dataSeries, "deletions") }
        ],
        plotOptions: {
          series: {
            stacking: 'normal'
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
        yAxis: { title: { text: 'Lines of Code' }},
        series: [
          { name: 'files', data: _.map(dataSeries, "files") },
          { name: 'insertions', data: _.map(dataSeries, "insertions") },
          { name: 'deletions', data: _.map(dataSeries, "deletions") }
        ],
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

    const dataSeries = DataReducers.timeVsLocDetailsForOneProject(this.props.project)

    return (
      <PaperLayout id="time-vs-loc-details-chart" title="Lines of Code Details by Timeline"
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        {this.state.view.chartType === 'column' && renderColumnChart(dataSeries)}
        {this.state.view.chartType === 'line' && renderLineChart(dataSeries)}
      </PaperLayout>
    )
  }
}

TimeVsLocDetailsChart.propTypes = {
  project: React.PropTypes.object
}
