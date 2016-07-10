import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import classNames from 'classnames'

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import AppBar from 'material-ui/AppBar'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import FontIcon from 'material-ui/FontIcon'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import NavigationClose from 'material-ui/svg-icons/navigation/close'
import ActionHome from 'material-ui/svg-icons/action/home'
import { deepOrange700 } from 'material-ui/styles/colors'

import HomePage from './home-page'
import ProjectsPage from './projects-page'
import AuthorsPage from './authors-page'
import OrganizationsPage from './organizations-page'

export default class App extends Component {

  constructor(props){
    super(props)
    this.state = {
      showPage: 'home'
    }
  }

  handlePageClick(showPage) {
    this.setState({showPage})
  }

  render() {
    if (!process.browser) return null

    console.info("App:render")
    const App = () => {
      return (
        <div id="opendaylight-spectrometer">
          <Toolbar className="toolbar">
            <ToolbarGroup firstChild={true}>
            {process.env.NODE_ENV !== 'test' && <img src={require('../../../assets/images/opendaylight.png')} className="logo"/>}
              <ToolbarTitle text="OpenDaylight Spectrometer" className="toolbar-title" />
            </ToolbarGroup>
            <ToolbarGroup>
              <FontIcon className="material-icons" title="Home" onClick={this.handlePageClick.bind(this, 'home')}>home</FontIcon>
              <FontIcon className="material-icons" title="Projects" onClick={this.handlePageClick.bind(this, 'projects')}>folder</FontIcon>
              <FontIcon className="material-icons" title="Organizations" onClick={this.handlePageClick.bind(this, 'organizations')}>business</FontIcon>
              {/*<FontIcon className="material-icons" title="Authors" onClick={this.handlePageClick.bind(this, 'authors')}>account_circle</FontIcon>*/}
              <IconMenu
                iconButtonElement={<FontIcon className="material-icons more-menu-icon">more_vert</FontIcon>}
                anchorOrigin={{horizontal: 'left', vertical: 'top'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}>
                <MenuItem primaryText="Help" linkButton={true} href="http://opendaylight-spectrometer.readthedocs.io/" target="_blank"/>
              </IconMenu>
            </ToolbarGroup>
          </Toolbar>
          {this.state.showPage === 'home' && <HomePage />}
          {this.state.showPage === 'projects' && <ProjectsPage />}
          {this.state.showPage === 'authors' && <AuthorsPage />}
          {this.state.showPage === 'organizations' && <OrganizationsPage />}
        </div>
      )
    }

    return (
      <MuiThemeProvider muiTheme={getMuiTheme()}>
        {App()}
      </MuiThemeProvider>
    )
  }
}
