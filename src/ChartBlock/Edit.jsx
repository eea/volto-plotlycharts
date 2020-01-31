import React, { Component } from 'react';
import { connect } from 'react-redux';

import 'react-chart-editor/lib/react-chart-editor.css';

import { changeSidebarState } from 'volto-sidebar/actions';
import ChartEditSidebar from './ChartEditSidebar';

function getDataSourceOptions(data) {
  return Object.keys(data).map(name => ({
    value: name,
    label: name,
  }));
}

const dataSources = {
  col1: [1, 2, 3], // eslint-disable-line no-magic-numbers
  col2: [4, 3, 2], // eslint-disable-line no-magic-numbers
  col3: [17, 13, 9], // eslint-disable-line no-magic-numbers
};

const config = { editable: true };

// TODO: this should be rewritten to use ModalEditor widget
class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      LoadablePlotlyEditor: false,
      plotly: null,
    };
  }
  componentDidMount() {
    this.props.changeSidebarState(true);

    import(
      /* webpackChunkName: 'LoadablePlotlyEditor' */ 'react-chart-editor'
    ).then(module => this.setState({ LoadablePlotlyEditor: module.default }));

    import(/* webpackChunkName: 'plotlydist' */ 'plotly.js/dist/plotly').then(
      module => this.setState({ plotly: module.default }),
    );
  }

  componentDidUpdate(prevProps) {
    // I think this should always be true
    if (this.props.url && this.props.url !== prevProps.url) {
      this.props.changeSidebarState(true);
      // this.props.getDataFromProvider(this.props.url);
    }
  }

  render() {
    const chartData = this.props.data.chartData || {
      layout: {},
      frames: [],
      data: [],
    };
    const dataSourceOptions = getDataSourceOptions(
      this.props.providerData || dataSources,
    );

    const LoadablePlotlyEditor = this.state.LoadablePlotlyEditor;

    return (
      <div>
        {__CLIENT__ && this.state.plotly && LoadablePlotlyEditor ? (
          <div className="block selected">
            <div className="block-inner-wrapper">
              <LoadablePlotlyEditor
                data={chartData.data}
                layout={chartData.layout}
                config={config}
                frames={chartData.frames}
                dataSources={this.props.providerData || dataSources}
                dataSourceOptions={dataSourceOptions}
                plotly={this.state.plotly}
                onUpdate={(data, layout, frames) => {
                  this.props.onChangeBlock(this.props.block, {
                    ...this.props.data,
                    chartData: {
                      data,
                      layout,
                      frames,
                    },
                  });
                }}
                useResizeHandler
                debug
                advancedTraceTypeSelector
              />
            </div>
            {this.props.selected ? <ChartEditSidebar {...this.props} /> : ''}
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default connect(
  (state, props) => {
    const provider_url = props.data?.url
      ? `${props.data.url}/@connector-data`
      : null;
    return {
      providerData: provider_url
        ? state.data_providers.data?.[provider_url]
        : null,
    };
  },
  { changeSidebarState },
)(Edit);
