import React, { Component } from 'react';

class About extends Component {

  render() {
    return (
        <div className="posts">
          <h1 className="post-title">OpenDaylight Spectrometer</h1>
          <p>
            OpenDaylight Spectrometer is a modern User Interface for showing statistics for OpenDaylight Projects.
            It uses Git and Gerrit Api to provide the statistics.
          </p>
          <div className="message">
          </div>
        </div>

    );
  }
}
export default About;
