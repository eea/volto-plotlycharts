/*
 * A component to help pick a visualization
 */
import { searchContent } from '@plone/volto/actions';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Grid, Form as UiForm } from 'semantic-ui-react';
import { Field } from '@plone/volto/components'; // EditBlock

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
  }

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.searchVisualizations();
    }
    // if (this.props.remoteChartData !== prevProps.remoteChartData) {
    //   console.log('we are here');
    //   this.setState({
    //     localChartData: this.props.remoteChartData,
    //   });
    // }
  }

  render() {
    //<UiForm>
    //</UiForm>
    return (
      <Field
        title="Pick chart from existing visualization"
        id="chart-data"
        choices={this.props.visualizations}
        required={true}
        onChange={this.onChange}
        value={this.props.value}
      />
    );
  }
}

export default connect(
  (state, props) => {
    // const chartData = state.data_providers ? state.data_providers.item : {};
    let visualizations = state.search
      ? state.search.subrequests?.getVisualizations?.items
      : [];
    visualizations = visualizations.map(el => [el['@id'], el.title]);
    return {
      visualizations,
      // remoteChartData:
      //   state.chart_data_visualization && state.chart_data_visualization.data,
    };
  },
  { searchContent },
)(PickVisualization);
