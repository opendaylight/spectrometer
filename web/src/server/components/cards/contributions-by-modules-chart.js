import React, { Component } from 'react';

import ReactHighcharts from 'react-highcharts'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'

const buttonActions = []

export default class ContributionsByModulesChart extends Component {

  constructor(props) {
    super(props)
    this.state = {
      view: {
        chartType: 'pie',
        sortBy: 'y',
        query: 'all',
        skewLeast: 0,
        skewMost: 0
      }
    }
  }

  handleButtonActions = (type, value) => { return null}

  render() {
    const renderPieChart = (dataSeries) => {
      const config = {
        chart: { type: 'pie' },
        title: { text: '' },
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
      dataSeries = DataReducers.commitCountForAllProjectsPerOrg(this.props.projects, this.props.organization, this.state.view.sortBy)
    } else {
      dataSeries = DataReducers.commitCountForAllProjects(this.props.projects, this.state.view.sortBy)
    }
    dataSeries = DataReducers.sliceAndGroupOthers(dataSeries.reverse(), 12, 'commitCount')

    return (
      <PaperLayout id="contributions-by-modules-chart" zDepth={2} title="Contributions By Modules"
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        {this.state.view.chartType === 'pie' && renderPieChart(dataSeries)}
      </PaperLayout>
    )
  }
}

ContributionsByModulesChart.propTypes = {
  projects: React.PropTypes.array,
  organization: React.PropTypes.string
}
