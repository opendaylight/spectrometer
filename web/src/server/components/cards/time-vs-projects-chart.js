import React, { Component } from 'react';

import ReactHighcharts from 'react-highcharts'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'

const buttonActions = [
  {type: 'chartType', option: 'scatter', icon: 'bubble_chart', tooltip: 'Scatter Chart'},
  {type: 'sortBy', option: 'x', icon: 'sort_by_alpha', tooltip: 'Sort by Project', group: true},
  {type: 'sortBy', option: 'y', icon: 'sort', tooltip: 'Sort by Commits'}
]

export default class TimeVsProjectsChart extends Component {

  constructor(props) {
    super(props)
    this.state = {
      view: {
        chartType: 'scatter',
        sortBy: 'x'
      }
    }
  }

  handleButtonActions = (type, value) => {
    const newView = _.merge(this.state.view, {[type]: value})
    this.setState({ view: newView })
  }

  render() {
    if (_.isEmpty(this.props.projects)) return null

    const dataSeries = DataReducers.timelineForAllProjects(this.props.projects, this.state.view.sortBy)
    // console.info("TimeVsProjectsChart", JSON.stringify(dataSeries, undefined, 2))
    const renderBubbleChart = (dataSeries) => {
      const timeLabels = _(dataSeries).map("firstCommit").sortBy().map(x => DataReducers.toMonthYearFormat(x)).valueOf()
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
        series: [{ name: 'master', colorByPoint: true, data: _.map(dataSeries, (d) => { return [projectLabels.indexOf(d.name), timeLabels.indexOf(DataReducers.toMonthYearFormat(d.firstCommit))]}) }]
      }
      return (
        <ReactHighcharts config={config} />
      )
    }

    return (
      <PaperLayout id="time-vs-projects-chart" title="OpenDaylight Projects Timeline"
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        {this.state.view.chartType === 'scatter' && renderBubbleChart(dataSeries)}
        {/*{this.state.view.chartType === 'pie' && renderPieChart(dataSeries)}*/}
      </PaperLayout>
    )
  }
}

TimeVsProjectsChart.propTypes = {
  projects: React.PropTypes.array
}
