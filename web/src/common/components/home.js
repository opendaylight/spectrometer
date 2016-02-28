import React, { Component } from 'react';

class Home extends Component {

  render() {
    return (
      <div className="posts">
        <div className="post">
          <h1 className="post-title">Introducing the new OpenDaylight Spectrometer</h1>
          <h3>Features</h3>
          <ul>
            <li>Statistics based on Git and Gerrit API</li>
            <li>Modern Mobile Friendly User Interface</li>
            <li>Pre-defined Charts, Timelines</li>
          </ul>
          <h3>Ideas</h3>
          <ul>
            <li>Dynamic Visualization</li>
          </ul>
        </div>
      </div>

    );
  }
}

export default Home;
