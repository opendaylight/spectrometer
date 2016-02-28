import React, { Component, PropTypes } from 'react';

class Header extends Component {

  render() {

    return (
      <div className="masthead">
              <div className="container">
                 <h2 className="masthead-title">
                    <a href="/" title="Home">OpenDaylight Spectrometer</a>
                 </h2>
              </div>
          </div>
    );
  }
}

export default Header;
