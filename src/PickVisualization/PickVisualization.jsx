/*
 * A component to help pick a visualization
 *
 * TODO: right now we trigger fetch on vis data when we change the provider. Is
 * this needed? I don't think so.
 */

import { connect } from 'react-redux';
import React, { Component } from 'react';
// import PickObject from 'volto-addons/PickObject';
import PickObject from '../Widget/PickObject';
import { getChartDataFromVisualization } from 'volto-plotlycharts/actions';

class PickVisualization extends Component {
  componentDidMount() {
    if (this.props.value) {
      this.props.getChartDataFromVisualization(this.props.value);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value && this.props.value) {
      this.props.getChartDataFromVisualization(this.props.value);
    }

    // This is a hack to enable saving the chartData in the embed chart blocks.
    // The block needs to be refactored, vis_url logically belongs together
    // with the chartData and they should not be separate. chartData is just
    // a cache of the data. Probably we should not even use it, or at least we
    // should name it accordingly.
    if (
      this.props.remoteChartData &&
      JSON.stringify(prevProps.remoteChartData || {}) !==
        JSON.stringify(this.props.remoteChartData || {})
    ) {
      this.props.onChange('chartData', this.props.remoteChartData);
    }
  }

  render() {
    return <PickObject {...this.props} />;
  }
}

export default connect(
  (state, props) => {
    return {
      remoteChartData: state.chart_data_visualization[props.value]?.item || {},
    };
  },
  { getChartDataFromVisualization },
)(PickVisualization);
