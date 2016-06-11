import React, { Component } from 'react';

import ReactHighcharts from 'react-highcharts'

import * as DataReducers from '../../api/data-reducers'
import PaperLayout from '../layouts/paper-layout'

const buttonActions = [
  {type: 'chartType', option: 'column', icon: 'insert_chart', tooltip: 'Show as Column Chart'},
  {type: 'chartType', option: 'pie', icon: 'pie_chart_outlined', tooltip: 'Show as Pie chart'},
  {type: 'sortBy', option: 'x', icon: 'sort_by_alpha', tooltip: 'Sort by X axis', group: true},
  {type: 'sortBy', option: 'y', icon: 'sort', tooltip: 'Sort by Y axis'}
]
export default class AuthorsVsLocChart extends Component {

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
        xAxis: { title: { text: 'Authors'  }, categories: _.map(dataSeries, "name") },
        yAxis: { title: { text: 'Lines of Code' }},
        series: [{ name: 'LOC', colorByPoint: true, data: _.map(dataSeries, "loc") }],
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
          data: _.map(dataSeries, (x) => { return {name: x.name, y: x.loc} })
        }]
      }
      return (
        <ReactHighcharts config={config} />
      )
    }

    if (_.isEmpty(this.props.project)) return null;

    const dataSeries = DataReducers.authorsVsLocForOneProject(this.props.project, this.state.view.sortBy)

    return (
      <PaperLayout id="authors-vs-loc-chart" title="LoC contributed by authors"
        buttonActions={buttonActions} currentView={this.state.view}
        handleButtonActions={this.handleButtonActions.bind(this)}>
        {this.state.view.chartType === 'column' && renderColumnChart(dataSeries)}
        {this.state.view.chartType === 'pie' && renderPieChart(dataSeries)}
      </PaperLayout>
    )
  }
}

AuthorsVsLocChart.propTypes = {
  project: React.PropTypes.object
}
