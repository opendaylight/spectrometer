import React, { Component } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';

class Sidebar extends Component {

  constructor(props){
    super(props);
  }

  render() {

    const {version} = this.props;

    return (
      <div className="sidebar">
        <nav className="sidebar-nav">
          <Link to="/home" className="sidebar-nav-item" activeClassName="active">Home</Link>
          <Link to="/git-commits" className="sidebar-nav-item" activeClassName="active">Git Commits</Link>
          <Link to="/gerrit-projects" className="sidebar-nav-item" activeClassName="active">Gerrit Projects</Link>
          <Link to="/about" className="sidebar-nav-item" activeClassName="active">About</Link>
          <span className="sidebar-nav-item"><span className="nav-note version">{`Version ${version}`}</span></span>
        </nav>

        <div className="sidebar-item sidebar-footer">
          <p>
          Visit <a href="https://gerrit.com">Gerrit Repo</a><br/>
          </p>
        </div>
      </div>
    );
  }
}

export default Sidebar;
