/*
 * A component to help pick a visualization
 */
import { searchContent, getContent } from '@plone/volto/actions';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Field } from '@plone/volto/components'; // EditBlock

class PickVisualization extends Component {
  searchVisualizations = () => {
    this.props.searchContent(
      '',
      {
        // object_provides: 'forests.content.interfaces.IDataVisualization',
        portal_type: 'visualization',
      },
      this.props.id,
    );
  };

  componentDidMount() {
    this.searchVisualizations();

    if (this.props.value) {
      this.props.getContent(this.props.value, null, this.props.id);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.props.getContent(this.props.value, null, this.props.id);
    }
    if (
      JSON.stringify(this.props.currentChartData || {}) !==
      JSON.stringify(this.props.remoteChartData || {})
    )
      this.props.onLoadChartData(this.props.remoteChartData);
  }

  render() {
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
    let visualizations = state.search
      ? state.search.subrequests?.[props.id]?.items || []
      : [];
    visualizations = visualizations.map(el => [el['@id'], el.title]);
    return {
      remoteChartData: state.content.subrequests?.[props.id]?.items || {},
      visualizations,
    };
  },
  { searchContent, getContent },
)(PickVisualization);
