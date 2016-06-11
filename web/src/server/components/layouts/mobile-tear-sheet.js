import _ from 'lodash'
import moment from 'moment'

import React, { Component } from 'react'

export default class MobileTearSheet extends Component {
  render() {
    return (
      <div className="mobile-tear-sheet">
        {this.props.children}
      </div>
    )
  }
}
