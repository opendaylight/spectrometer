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
 * React component to display Organizations vs Authors Chart
 * Used in ContributorsCard
 * Uses ChartLayout
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import React, { Component } from 'react';
import Griddle from 'griddle-react'
import ReactHighcharts from 'react-highcharts'

import * as DataReducers from '../../api/data-reducers'

import ChartLayout from '../chart-layout'

const ChartConfig = require('../../../../config/spectrometer-web.json').chart

const buttonActions = [
  {type: 'chartType', option: 'pie', icon: 'pie_chart_outlined', tooltip: 'Show as Pie Chart'},
  {type: 'chartType', option: 'table', icon: 'format_list_numbered', tooltip: 'Show as Table'}
]

const pieChart = (dataSeries, takeRight) => {
  const ds = DataReducers.sliceAndGroupOthers(dataSeries, takeRight, 'authorCount')
  const config = {
    chart: { type: 'pie' },
    title: { text: '' },
    tooltip: {
      pointFormat: '{series.name}: {point.y}'
    },
    legend: {
      align: 'right',
      layout: 'vertical',
      verticalAlign: 'top'
    },
    colors: ChartConfig.pieChartColors,
    plotOptions: {
      pie: {
        allowPointSelect: true, cursor: 'pointer',
        dataLabels: {
          enabled: true, color: 'black',
          formatter: function() { return this.point.name + ' ' + this.point.y + ' (' + (Math.round(this.percentage*100)/100 + ' %)') }
        },
        showInLegend: true
      }
    },
    series: [{
      name: 'Authors',
      colorByPoint: true,
      data: _.map(ds, (x) => { return {name: x.name, y: x.authorCount} })
    }]
  }
  return (<ReactHighcharts config={config} />)
}

const COLUMN_METADATA = [
  { columnName: "name", displayName: "Name" },
  { columnName: "authorCount", displayName: "No. of Authors", cssClassName: 'td-values' }
]

const tableChart = (dataSeries, height) => {
  return (
    <Griddle id="organizations-vs-authors-table"
      tableClassName="table-chart"
      bodyHeight={height}
      results={_.orderBy(dataSeries, ['authorCount'], ['desc'])}
      showFilter={true} showSettings={false}
      columnMetadata={COLUMN_METADATA}
      filterPlaceholderText="Find..."
      useFixedHeader={true}
      enableInfiniteScroll={true} />
  )
}

export default class OrganizationsVsAuthorsChart extends Component {

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
    const { takeRight, tableHeight } = this.state.view;
    const dataSeries = DataReducers.organizationsVsAuthorsCountForAllProjects(this.props.projects)

    //Hide buttons that are specified in hideButtons props
    // const buttonActionsAllowed = _.reject(buttonActions, x => props.hideButtons.indexOf(x.type) >= 0)
    return (
      <ChartLayout id="orgs-vs-authors-chart" title="No. of authors per organization"
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions}>
        {this.state.view.chartType === 'pie' && pieChart(dataSeries, takeRight)}
        {this.state.view.chartType === 'table' && tableChart(dataSeries, tableHeight)}
      </ChartLayout>
    )
  }
}

const DEFAULT_VIEW = {
  chartType: 'pie',
  sortBy: 'x',
  name: undefined,
  ref1: undefined,
  ref2: undefined,
  organization: undefined,
  author: undefined,
  startDate: undefined,
  endDate: undefined,
  takeLeft: undefined,
  takeRight: undefined,
  tableHeight: 350
}

OrganizationsVsAuthorsChart.propTypes = {
  projects: React.PropTypes.array.isRequired,
  view: React.PropTypes.object
}
