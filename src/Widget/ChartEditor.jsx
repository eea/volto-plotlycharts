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

const chartHelp = {
  area: {
    helpDoc: 'https://help.plot.ly/make-an-area-graph/',
    examplePlot: () => {
      console.log('example bar plot!');
    },
  },
  bar: {
    helpDoc: 'https://help.plot.ly/stacked-bar-chart/',
    examplePlot: () => {
      console.log('example bar plot!');
    },
  },
  box: { helpDoc: 'https://help.plot.ly/make-a-box-plot/' },
  candlestick: { helpDoc: 'https://help.plot.ly/make-a-candlestick/' },
  choropleth: { helpDoc: 'https://help.plot.ly/make-a-choropleth-map/' },
  contour: { helpDoc: 'https://help.plot.ly/make-a-contour-plot/' },
  heatmap: { helpDoc: 'https://help.plot.ly/make-a-heatmap/' },
  histogram2d: { helpDoc: 'https://help.plot.ly/make-a-2d-histogram-heatmap/' },
  histogram2dcontour: { helpDoc: 'https://help.plot.ly/make-a-histogram/' },
  line: { helpDoc: 'https://help.plot.ly/make-a-line-graph/' },
  mesh3d: { helpDoc: null },
  ohlc: { helpDoc: 'https://help.plot.ly/make-a-ohlc/' },
  pie: { helpDoc: 'https://help.plot.ly/make-a-pie-chart/' },
  scatter3d: { helpDoc: 'https://help.plot.ly/make-a-3d-scatter-plot/' },
  line3d: { helpDoc: null },
  scatter: { helpDoc: 'https://help.plot.ly/how-to-make-a-scatter-plot/' },
  scattergeo: { helpDoc: 'https://help.plot.ly/make-scatter-map/' },
  scattermapbox: { helpDoc: 'https://help.plot.ly/make-a-mapbox-map/' },
  scatterternary: { helpDoc: 'https://help.plot.ly/ternary-scatter-plot/' },
  surface: { helpDoc: 'https://help.plot.ly/make-a-3d-surface-plot/' },
  table: { helpDoc: null },
  timeseries: { helpDoc: 'https://help.plot.ly/range-slider/' },
};

const imports = {
  PlotlyEditor: import(
    /* webpackChunkName: 'plotlyeditor' */ 'react-chart-editor'
  ),
  plotly: import(/* webpackChunkName: 'plotlydist' */ 'plotly.js/dist/plotly'),
};

const resolveImports = async imports => {
  const res = {};
  for (const name in imports) {
    await imports[name].then(module => (res[name] = module.default));
  }
  return res;
};

class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plotly: null,
      PlotlyEditor: null,
    };
  }
  async componentDidMount() {
    const modules = await resolveImports(imports);
    this.setState({ ...modules });
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
                chartHelp={chartHelp}
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
