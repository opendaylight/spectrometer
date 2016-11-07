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
 * React component to display Timeline of LoC Modified chart
 * Used in N/A
 * Uses ChartLayout
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import React, { Component } from 'react';

import ReactHighcharts from 'react-highcharts'

import * as DataReducers from '../../api/data-reducers'
import ChartLayout from '../chart-layout'

const buttonActions = [
  {type: 'chartType', option: 'column', icon: 'insert_chart', tooltip: 'Show as Bar Chart'},
  {type: 'chartType', option: 'line', icon: 'multiline_chart', tooltip: 'Show as Line chart'}
]

const columnChart = (dataSeries) => {
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

const lineChart = (dataSeries) => {
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
  return ( <ReactHighcharts config={config} /> )
}

export default class TimeVsLocDetailsChart extends Component {

  constructor(props) {
    super(props)
    this.state = {
      view: _.assign({}, DEFAULT_VIEW, props.view)
    }
    this.handleButtonActions = this.handleButtonActions.bind(this)
  }

  handleButtonActions = (type, value) => {
    const newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    if (_.isEmpty(this.props.project)) return null;

    const dataSeries = DataReducers.timeVsLocDetailsForOneProject(this.props.project)

    return (
      <ChartLayout id="time-vs-loc-details-chart" title="Lines of Code Details by Timeline"
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions}>
        {this.state.view.chartType === 'column' && columnChart(dataSeries)}
        {this.state.view.chartType === 'line' && lineChart(dataSeries)}
      </ChartLayout>
    )
  }
}

const DEFAULT_VIEW = {
  chartType: 'column',
  sortBy: 'x'
}

TimeVsLocDetailsChart.propTypes = {
  project: React.PropTypes.object,
  view: React.PropTypes.object
}
