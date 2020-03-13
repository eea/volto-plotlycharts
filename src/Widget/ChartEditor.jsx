/*
 * A wrapper around the react-chart-editor component.
 *
 */

import React, { Component } from 'react';
import { updateChartDataFromProvider } from 'volto-datablocks/helpers';

import { connect } from 'react-redux';
import 'react-chart-editor/../lib/react-chart-editor.css';
import './fixes.css';
//import 'react-chart-editor/styles/main.scss';

// TODO: remove these fallbacks;
const dataSources = {
  col1: [1, 2, 3],
  col2: [4, 3, 2],
  col3: [17, 13, 9],
};

const config = { editable: true };

function getDataSourceOptions(data) {
  return Object.keys(data).map(name => ({
    value: name,
    label: name,
  }));
}

class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plotly: null,
      PlotlyEditor: null,
    };
  }
  componentDidMount() {
    import(/* webpackChunkName: 'plotlyeditor' */ 'react-chart-editor').then(
      module =>
        this.setState({ PlotlyEditor: module.default }, () =>
          import(
            /* webpackChunkName: 'plotlydist' */ 'plotly.js/dist/plotly'
          ).then(module => this.setState({ plotly: module.default })),
        ),
    );
  }
  render() {
    if (__SERVER__) return '';

    const dataSourceOptions = getDataSourceOptions(
      this.props.providerData || dataSources,
    );

    const updatedData = updateChartDataFromProvider(
      this.props.value?.data || [],
      [],
    );

    const { plotly, PlotlyEditor } = this.state;

    return (
      <div>
        {plotly && PlotlyEditor && (
          <div className="block selected">
            <div className="block-inner-wrapper">
              <PlotlyEditor
                config={config}
                data={updatedData}
                layout={this.props.value?.layout || {}}
                frames={this.props.value?.frames || []}
                dataSourceOptions={dataSourceOptions}
                dataSources={this.props.providerData || dataSources}
                plotly={this.state.plotly}
                onUpdate={(data, layout, frames) => {
                  return this.props.onChangeValue({
                    ...this.props.value,
                    data,
                    layout,
                    frames,
                  });
                }}
                showFieldTooltips
                useResizeHandler
                debug
                advancedTraceTypeSelector
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  (state, props) => {
    const base = props.provider_url || props.value?.provider_url;
    const provider_url = base ? `${base}/@connector-data` : null;
    return {
      providerData: provider_url
        ? state.data_providers.data?.[provider_url]
        : null,
    };
  },
  null,
)(Edit);
