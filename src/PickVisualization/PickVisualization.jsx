/*
 * A component to help pick a visualization
 */
import { searchContent } from '@plone/volto/actions';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Field } from '@plone/volto/components'; // EditBlock

import { getChartDataFromVisualization } from '../actions';

class PickVisualization extends Component {
  searchVisualizations = () => {
    this.props.searchContent(
      '',
      {
        // object_provides: 'forests.content.interfaces.IDataVisualization',
        portal_type: 'visualization',
      },
      'getVisualizations',
    );
  };

  componentDidMount() {
    this.searchVisualizations();

    if (this.props.value) {
      // TODO: use getContent with subrequest, no need for specially dedicated
      // action and reducer. Complication not needed.
      this.props.getChartDataFromVisualization(this.props.value);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.props.getChartDataFromVisualization(this.props.value);
    }
    if (
      JSON.stringify(this.props.currentChartData || {}) !==
      JSON.stringify(this.props.remoteChartData || {})
    )
      this.props.onLoadChartData(this.props.remoteChartData);
  }

  render() {
    console.log('vis props', this.props);
    return (
      <Field
        title="Visualization"
        id="chart-data"
        choices={this.props.visualizations}
        required={true}
        onChange={(id, value) => this.props.onChange(value)}
        value={this.props.value}
      />
    );
  }
}

export default connect(
  (state, props) => {
    // const chartData = state.data_providers ? state.data_providers.item : {};
    let visualizations = state.search
      ? state.search.subrequests?.getVisualizations?.items || []
      : [];
    visualizations = visualizations.map(el => [el['@id'], el.title]);
    return {
      visualizations,
      remoteChartData:
        state.chart_data_visualization && state.chart_data_visualization.data,
    };
  },
  { searchContent, getChartDataFromVisualization },
)(PickVisualization);
