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
 * React component to display Timeline of Commits chart
 * Used in TimelineCard
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
  {type: 'chartType', option: 'line', icon: 'multiline_chart', tooltip: 'Area chart'}
]

const lineChart = (dataSeries) => {
  const config = {
    chart: { type: 'line' },
    title: { text: '' },
    xAxis: [{ title: { text: 'Time'  }, categories: _.map(dataSeries, "name") }],
    yAxis: [{ title: { text: 'Commits' }}, { title: { text: 'LoC Modified' }, opposite: true}],
    series: [
      { name: 'Commits', type: 'area', data: _.map(dataSeries, "commitCount") },
      { name: 'LoC Modified', type: 'spline', yAxis: 1, data: _.map(dataSeries, "loc") }
    ],
    tooltip: {
      pointFormat: '{series.name}: {point.y}'
    },
    plotOptions: {
      line: {
        allowPointSelect: true, cursor: 'pointer',
        dataLabels: { enabled: true },
        enableMouseTracking: false
      }
    }
  }
  return (<ReactHighcharts config={config} />)
}

export default class TimeVsCommitsChart extends Component {

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
    if (_.isEmpty(this.props.projects)) return null;
    logger.info("time-vs-commits-chart:render", this.state.view)
    const { name, ref1, ref2, author } = this.state.view
    const dataSeries = DataReducers.timeVsCommitCount(this.props.projects, {name, ref1, ref2, author, sortBy: 'x'})

    return (
      <ChartLayout id="time-vs-loc-chart" title="Commits by Timeline"
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions}>
        {lineChart(dataSeries)}
      </ChartLayout>
    )
  }
}

const DEFAULT_VIEW = {
  chartType: 'line',
  sortBy: 'x'
}

TimeVsCommitsChart.propTypes = {
  projects: React.PropTypes.array,
  view: React.PropTypes.object
}
