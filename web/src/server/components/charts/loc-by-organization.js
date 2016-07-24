import React, { Component } from 'react';

import ReactHighcharts from 'react-highcharts'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'

const buttonActions = [
  {type: 'chartType', option: 'pie', icon: 'pie_chart_outlined', tooltip: 'Show as Pie Chart'},
  {type: 'chartType', option: 'detailed', icon: 'format_list_numbered', tooltip: 'Show Detailed'},
]

export default class LocByOrganizationChart extends Component {

  constructor(props) {
    super(props)
    this.state = {
      showCheckboxes: false,
      height: '400px',
      view: {
        chartType: 'pie',
        sortBy: 'y',
      }
    }
  }

  handleButtonActions = (type, value) => {
    let newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    const renderPieChart = (dataSeries) => {
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
        colors: ['#e2cf56', '#aee256', '#68e256', '#56e289', '#56e2cf', '#56aee2',
                 '#5668e2', '#8a56e2', '#cf56e2', '#e256ae', '#e25668', '#e28956'],
        plotOptions: {
          pie: {
            allowPointSelect: true,
            cursor: 'pointer',
            dataLabels: {
              enabled: true,
              formatter: function() {
                      if (this.percentage <= 2) return null;

                      return Math.round(this.percentage) + ' %';
              },
              distance: -30,
              color: 'white',
              style: {
                textShadow: false
              }
            },
            showInLegend: true
          }
        },
        series: [{
          name: 'LOC',
          colorByPoint: true,
          data: _.map(dataSeries, (x) => { return {name: x.name, y: x.loc} })
        }]
      }
      return (
        <ReactHighcharts config={config} />
      )
    }

    const renderDetailedChart = (dataSeries) => {
      return (
        <Table
          height={this.state.height}
        >
          <TableHeader
            displaySelectAll={this.state.showCheckboxes}
            adjustForCheckbox={this.state.showCheckboxes}
          >
            <TableRow>
              <TableHeaderColumn>#</TableHeaderColumn>
              <TableHeaderColumn>Organization</TableHeaderColumn>
              <TableHeaderColumn>Commits</TableHeaderColumn>
            </TableRow>
          </TableHeader>

          <TableBody
            displayRowCheckbox={this.state.showCheckboxes}
          >
            {dataSeries.map((org, index) => (
              <TableRow>
                <TableRowColumn>{index+1}</TableRowColumn>
                <TableRowColumn>{org.name}</TableRowColumn>
                <TableRowColumn>{org.loc}</TableRowColumn>
               </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }

    console.log("organizations-vs-loc-chart:", this.state.view.chartType, this.state.view.sortBy)
    let dataSeries = []
    if (!_.isEmpty(this.props.projects) && !_.isEmpty(this.props.organization)) {
      dataSeries = DataReducers.organizationsVsLocForAllProjects(this.props.projects, this.props.organization, this.state.view.sortBy)
    } else if (!_.isEmpty(this.props.project)) {
      dataSeries = DataReducers.organizationsVsLocForOneProject(this.props.project, null, this.state.view.sortBy)
    } else if (!_.isEmpty(this.props.projects)) {
      dataSeries = DataReducers.organizationsVsLocForAllProjects(this.props.projects, null, this.state.view.sortBy, this.state.view.query)
    }

    let fullData = dataSeries
    dataSeries = DataReducers.sliceAndGroupOthers(dataSeries.reverse(), 12, 'loc')

    return (
      <PaperLayout id="orgs-vs-loc-chart" title="LOC contributed by organization"
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        {this.state.view.chartType === 'pie' && renderPieChart(dataSeries)}
        {this.state.view.chartType === 'detailed' && renderDetailedChart(fullData)}
      </PaperLayout>
    )
  }
}

LocByOrganizationChart.propTypes = {
  projects: React.PropTypes.array,
  project: React.PropTypes.object,
  organization: React.PropTypes.string
}
