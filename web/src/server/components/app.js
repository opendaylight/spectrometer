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
 * Main React Component, starting point for the UI App
 * Used in routes.js as the default starting point for the UI App
 *
 * @author: Vasu Srinivasan
 * @since: 0.0.1
 */

import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classNames from 'classnames'

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import AppBar from 'material-ui/AppBar'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import FontIcon from 'material-ui/FontIcon'

import ReactHighcharts from 'react-highcharts'

const ChartConfig = require('../../../config/spectrometer-web.json').chart
const WebSocketUrl = require('../../../config/spectrometer-web.json').app.websocketUrl

@connect(state => ({
  projects: state.spectro.projects
}))
export default class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      showPage: 'home'
    }
  }

  componentWillMount() {
    if (process.browser) {
      // set global  Highcharts style
      ReactHighcharts.Highcharts.setOptions({ chart: { style: ChartConfig.style  } });
    }
  }

  handlePageClick(showPage) {
    this.setState({showPage})
  }

  render() {
    if (!process.browser) return null

    logger.info("App:render: #projects", this.props.projects.length)
    const App = () => {
      return (
        <div id="opendaylight-spectrometer-main" className="page-layout">
          <Toolbar id="page-header" className="toolbar">
            <ToolbarGroup firstChild={true}>
              {process.env.NODE_ENV !== 'test' && <img src={require('../../../assets/images/opendaylight.png')} className="logo"/>}
              <ToolbarTitle text="OpenDaylight Spectrometer" className="toolbar-title" />
            </ToolbarGroup>
            <ToolbarGroup>
              <FontIcon className="material-icons" title="Home"><Link activeClassName="selected"  to="/home">home</Link></FontIcon>
              <FontIcon className="material-icons" title="Authors" onClick={this.handlePageClick.bind(this, 'authors')}><Link activeClassName="selected" to="/authors">people</Link></FontIcon>
              <FontIcon className="material-icons" title="Projects" onClick={this.handlePageClick.bind(this, 'projects')}><Link  activeClassName="selected" to="/projects">folder</Link></FontIcon>
              <FontIcon className="material-icons" title="Organizations" onClick={this.handlePageClick.bind(this, 'organizations')}><Link  activeClassName="selected" to="/organizations">business</Link></FontIcon>
              <FontIcon className="material-icons" title="Help"><Link href="http://opendaylight-spectrometer.readthedocs.io/" target="_blank">help</Link></FontIcon>
            </ToolbarGroup>
          </Toolbar>
          {this.props.children}
        </div>
      )
    }

    const muiTheme = getMuiTheme({
      'fontFamily': 'Ubuntu'
    })

    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        {App()}
      </MuiThemeProvider>
    )
  }
}
