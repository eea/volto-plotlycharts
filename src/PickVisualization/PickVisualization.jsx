/*
 * A component to help pick a visualization
 */

import { searchContent, getContent } from '@plone/volto/actions';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import PickObject from 'volto-addons/PickObject';

class PickVisualization extends Component {
  componentDidMount() {
    if (this.props.value) {
      this.props.getContent(this.props.value, null, this.props.value);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value && this.props.value) {
      this.props.getContent(this.props.value, null, this.props.value);
    }
    if (
      JSON.stringify(this.props.currentChartData || {}) !==
      JSON.stringify(this.props.remoteChartData || {})
    ) {
      this.props.onLoadChartData(this.props.remoteChartData);
    }
  }

  render() {
    return (
      <PickObject
        id="visualization"
        title="Visualization"
        value={this.props.value}
        onChange={this.props.onChange}
      />
    );
  }
}

export default connect(
  (state, props) => {
    const content = state.content.subrequests?.[props.value] || {};
    return {
      remoteChartData: content.data?.visualization || {},
    };
  },
  { searchContent, getContent },
)(PickVisualization);
