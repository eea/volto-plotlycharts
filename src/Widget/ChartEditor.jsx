/*
 * A wrapper around the react-chart-editor component.
 *
 */

import React, { Component } from 'react';
import { updateChartDataFromProvider } from 'volto-datablocks/helpers';

import { connect } from 'react-redux';
import 'react-chart-editor/lib/react-chart-editor.css';
import Inspector from 'react-inspector';

import './fixes.css';

const imports = {
  PlotlyEditor:
    __CLIENT__ &&
    import(/* webpackChunkName: 'plotlyeditor' */ 'react-chart-editor'),
  plotly:
    __CLIENT__ &&
    import(/* webpackChunkName: 'plotlydist' */ 'plotly.js/dist/plotly'),
  CustomEditor:
    __CLIENT__ && import(/* webpackChunkName: 'plotlydist' */ './CustomEditor'),
};

const resolveImports = async (imports) => {
  const res = {};
  for (const name in imports) {
    await imports[name].then((module) => (res[name] = module)); // .default
  }
  return res;
};

// TODO: remove these fallbacks;
const dataSources = {
  col1: [1, 2, 3],
  col2: [4213321.567, 3231123.4, 2929845.5721],
  col3: [1746.424, 12353.532, 9124.21],
};

const config = { editable: true };

function getDataSourceOptions(data) {
  return Object.keys(data).map((name) => ({
    value: name,
    label: name,
  }));
}

function updateDataFromColors(data, props) {
  return data;
}

const chartHelp = {
  area: {
    helpDoc: 'https://help.plot.ly/make-an-area-graph/',
    examplePlot: () => {},
  },
  bar: {
    helpDoc: 'https://help.plot.ly/stacked-bar-chart/',
    examplePlot: () => {},
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

class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plotly: null,
      PlotlyEditor: null,
    };
  }

  async componentDidMount() {
    if (__CLIENT__) {
      const modules = await resolveImports(imports);
      this.setState({ ...modules });
    }
  }
  render() {
    if (__SERVER__) return '';

    const dataSourceOptions = getDataSourceOptions(
      this.props.providerData || dataSources,
    );

    const updatedData = updateDataFromColors(
      updateChartDataFromProvider(this.props.value?.data || [], []),
      this.props,
    );

    const { plotly, PlotlyEditor, CustomEditor } = this.state;
    const { DefaultEditor, Panel } = PlotlyEditor || {};
    const DefaultPlotlyEditor = PlotlyEditor?.default;
    const DefaultCustomEditor = CustomEditor?.default;
    // https://www.eea.europa.eu/++resource++eea.translations.images/pdflogo-web.png
    return (
      <div>
        {plotly && PlotlyEditor && DefaultEditor && (
          <div className="block selected">
            <div className="block-inner-wrapper">
              <DefaultPlotlyEditor
                config={config}
                data={updatedData}
                layout={this.props.value?.layout || {}}
                frames={this.props.value?.frames || []}
                dataSourceOptions={dataSourceOptions}
                dataSources={this.props.providerData || dataSources}
                plotly={this.state.plotly.default}
                divId="gd"
                onUpdate={(data, layout, frames) => {
                  this.props.onChangeValue({
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
              >
                <DefaultCustomEditor
                  onChangeValue={this.props.onChangeValue}
                  value={this.props.value}
                  logoSrc=""
                >
                  <Panel group="Dev" name="Inspector">
                    <button
                      className="devbtn"
                      onClick={() => {
                        const gd = document.getElementById('gd') || {};
                        this.setState({
                          full: {
                            _fullData: gd._fullData || [],
                            _fullLayout: gd._fullLayout || {},
                          },
                        });
                      }}
                    >
                      Refresh
                    </button>
                    <div style={{ height: '80vh' }}>
                      <Inspector
                        data={{ _full: this.state.full }}
                        expandLevel={2}
                        sortObjectKeys={true}
                      />
                    </div>
                  </Panel>
                </DefaultCustomEditor>
              </DefaultPlotlyEditor>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect((state, props) => {
  const base = props.provider_url || props.value?.provider_url;
  const provider_url = base ? `${base}/@connector-data` : null;
  return {
    providerData: provider_url
      ? state.data_providers.data?.[provider_url]
      : null,
  };
}, null)(Edit);
