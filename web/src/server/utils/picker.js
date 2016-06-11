import React, { Component, PropTypes } from 'react';

export default class Picker extends Component {
  render () {
    const { label, value, onChange, options } = this.props;

    return (
      <span className="posts-header">
        <span>{label}
          <select onChange={e => onChange(e.target.value)} value={value}>
            {
              options.map(option => <option value={option} key={option}>
                {option}
              </option>)
            }
        </select></span>
    </span>
    );
  }
}

Picker.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};
