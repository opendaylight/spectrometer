import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames';

// import * as UserActions from '../actions/user';
import * as LayoutActions from '../actions/layout';
import Home from '../components/home'
import Header from '../components/layout/header'
import Sidebar from '../components/layout/sidebar'

class App extends Component {

  constructor(props){
    super(props);
    this.eventToggleSidebar = this.eventToggleSidebar.bind(this)
  }

  eventToggleSidebar(e) {
    e.preventDefault();
    this.props.toggleSidebar(!this.props.layout.sidebarOpen);
  }

  render() {

    const { user, layout, version } = this.props;
    const { sidebarOpen } = layout;
    const layoutClass = classNames('wrapper',{open : sidebarOpen});

    return (
      <div className={layoutClass}>
        <Sidebar layout={layout} user={user} version={version} />
        <div className="wrap">
          <Header />
          <div className="container content">
            {!this.props.children && <Home />}
            {this.props.children}
          </div>
        </div>
        <label className="sidebar-toggle" onClick={this.eventToggleSidebar}></label>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    version : state.version,
    layout : state.layout
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(LayoutActions,dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
