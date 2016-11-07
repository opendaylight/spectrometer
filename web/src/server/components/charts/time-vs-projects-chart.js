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
 * React component to display Time vs Projects (Project Engagement by Timeline) Chart
 * Used in TimelineCard
 * Uses ChartLayout
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import React, { Component } from 'react';

import ReactHighcharts from 'react-highcharts'

import * as DataReducers from '../../api/data-reducers'
import {toMonthYearFormat} from '../../utils/utils'

import ChartLayout from '../chart-layout'

const buttonActions = [
  {type: 'chartType', option: 'scatter', icon: 'bubble_chart', tooltip: 'Scatter Chart'},
  {type: 'sortBy', option: 'x', icon: 'sort_by_alpha', tooltip: 'Sort by Project', group: true},
  {type: 'sortBy', option: 'y', icon: 'sort', tooltip: 'Sort by Commits'}
]

const scatterChart = (dataSeries) => {
  const timeLabels = _(dataSeries).map("firstCommit").sortBy().map(x => toMonthYearFormat(x)).valueOf()
  const projectLabels = _.map(dataSeries, "name")
  const config = {
    chart: { type: 'scatter', plotBorderWidth: 1, zoomType: 'xy' },
    legend: { enabled: false },
    title: { text: ''},
    xAxis: {
      title: { text: 'Projects'  }, startOnTick: true, endOnTick: true, showLastLabel: true, tickInterval: 1,
      labels: { formatter: function() { return projectLabels[this.value] } }
    },
    yAxis: {
      title: { text: 'Time' },
      labels: { formatter: function() { return timeLabels[this.value] } }
    },
    plotOptions: {
      scatter: {
        marker: {
          radius: 7,
          states: { hover: { enabled: true, lineColor: 'rgb(100,100,100)' } }
        },
        states: { hover: { marker: { enabled: false } } },
        tooltip: {
          headerFormat: '<b>{series.name}</b><br>',
          pointFormatter: function() { return `${projectLabels[this.x]} (${timeLabels[this.y]})` }
        }
      }
    },
    series: [{ name: 'master', colorByPoint: true, data: _.map(dataSeries, (d) => { return [projectLabels.indexOf(d.name), timeLabels.indexOf(toMonthYearFormat(d.firstCommit))]}) }]
  }
  return (<ReactHighcharts config={config} />)
}

export default class TimeVsProjectsChart extends Component {

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
    if (_.isEmpty(this.props.projects)) return null
    const {sortBy} = this.state.view
    const dataSeries = DataReducers.timeVsProjectsInitiation(this.props.projects, {sortBy})

    return (
      <ChartLayout id="time-vs-projects-chart" title="Projects Engagement By Timeline"
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions}>
        {scatterChart(dataSeries)}
      </ChartLayout>
    )
  }
}

const DEFAULT_VIEW = {
  chartType: 'scatter',
  sortBy: 'y'
}

TimeVsProjectsChart.propTypes = {
  projects: React.PropTypes.array,
  view: React.PropTypes.object
}
