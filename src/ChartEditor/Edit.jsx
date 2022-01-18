/*
 * A wrapper around the react-chart-editor component.
 */

import React, { Component } from 'react';
import { Tab, Button } from 'semantic-ui-react';
import loadable from '@loadable/component';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

import { updateChartDataFromProvider } from '@eeacms/volto-datablocks/helpers';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';

import 'react-chart-editor/lib/react-chart-editor.css';

const LoadablePlotly = loadable.lib(() => import('plotly.js/dist/plotly'));
const LoadablePlotlyEditor = loadable.lib(() => import('react-chart-editor'));
const LoadableChartEditor = loadable.lib(() => import('./ChartEditor'));
const LoadableInspector = loadable(() => import('react-inspector'));

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

const RawDataEditor = ({
  locale,
  dataPlaceholder,
  layoutPlaceholder,
  handleDataChange,
  handleLayoutChange,
}) => {
  const [dataObject, setDataObject] = React.useState(dataPlaceholder);
  const [layoutObject, setLayoutObject] = React.useState(layoutPlaceholder);

  const panes = [
    {
      menuItem: 'Data',
      render: () => (
        <Tab.Pane>
          <Button
            style={{ padding: '10px 20px', margin: '10px 0' }}
            primary
            disabled={dataObject.error ? true : false}
            onClick={() => handleDataChange(dataObject)}
          >
            Save
          </Button>
          <JSONInput
            id="raw_data_edit"
            theme="light_mitsuketa_tribute"
            locale={locale}
            height="550px"
            width="100%"
            placeholder={dataPlaceholder}
            onChange={(e) => setDataObject(e)}
          />
        </Tab.Pane>
      ),
    },
    {
      menuItem: 'Layout',
      render: () => (
        <Tab.Pane>
          <Button
            style={{ padding: '10px 20px', margin: '10px 0' }}
            primary
            disabled={layoutObject.error ? true : false}
            onClick={() => handleLayoutChange(layoutObject)}
          >
            Save
          </Button>
          <JSONInput
            id="raw_layout_edit"
            theme="light_mitsuketa_tribute"
            locale={locale}
            height="550px"
            width="100%"
            placeholder={layoutPlaceholder}
            onChange={(e) => setLayoutObject(e)}
          />
        </Tab.Pane>
      ),
    },
  ];
  return (
    <div style={{ width: '100%' }}>
      <Tab menu={{ secondary: true, pointing: true }} panes={panes} />
    </div>
  );
};

class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      full: null,
    };

    LoadablePlotly.preload();
    LoadablePlotlyEditor.preload();
    LoadableChartEditor.preload();
    LoadableInspector.preload();
  }

  handleRawDataChange = (val) => {
    this.props.onChangeValue({
      ...this.props.value,
      chartData: {
        ...this.props.chartData,
        data: val.jsObject,
      },
    });
  };

  handleRawLayoutChange = (val) => {
    this.props.onChangeValue({
      ...this.props.value,
      chartData: {
        ...this.props.chartData,
        layout: val.jsObject,
      },
    });
  };

  render() {
    if (__SERVER__) return '';

    const { chartData = {} } = this.props.value;
    const { data = [], layout = {}, frames = [] } = chartData;
    const provider_data = this.props.provider_data;

    const dataSourceOptions = getDataSourceOptions(
      provider_data || dataSources,
    );

    const updatedData = updateChartDataFromProvider(data, provider_data);

    return (
      <>
        <LoadablePlotlyEditor>
          {(plotlyEditor) => {
            const Panel = plotlyEditor.Panel;
            const PlotlyEditor = plotlyEditor.default;
            return (
              <LoadablePlotly>
                {(plotly) => {
                  return (
                    <LoadableChartEditor>
                      {(chartEditor) => {
                        const ChartEditor = chartEditor.default;
                        return (
                          <PlotlyEditor
                            divId="gd"
                            config={config}
                            data={updatedData}
                            layout={layout}
                            frames={frames}
                            dataSourceOptions={dataSourceOptions}
                            dataSources={
                              this.props.provider_data || dataSources
                            }
                            plotly={plotly}
                            onUpdate={(data, layout, frames) => {
                              this.props.onChangeValue({
                                ...this.props.value,
                                chartData: {
                                  ...chartData,
                                  data,
                                  layout,
                                  frames,
                                },
                              });
                            }}
                            chartHelp={chartHelp}
                            showFieldTooltips
                            useResizeHandler
                            debug
                            advancedTraceTypeSelector
                          >
                            {this.props.hasCustomData ? (
                              <RawDataEditor
                                locale={locale}
                                dataPlaceholder={data}
                                layoutPlaceholder={layout}
                                handleDataChange={(e) =>
                                  this.handleRawDataChange(e)
                                }
                                handleLayoutChange={(e) =>
                                  this.handleRawLayoutChange(e)
                                }
                              />
                            ) : (
                              <ChartEditor
                                onChangeValue={this.props.onChangeValue}
                                value={this.props.value}
                                logoSrc=""
                              >
                                <Panel group="Dev" name="Inspector">
                                  <button
                                    className="devbtn"
                                    onClick={() => {
                                      const gd =
                                        document.getElementById('gd') || {};
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
                                    <LoadableInspector
                                      data={{ _full: this.state.full }}
                                      expandLevel={2}
                                      sortObjectKeys={true}
                                    />
                                  </div>
                                </Panel>
                              </ChartEditor>
                            )}
                          </PlotlyEditor>
                        );
                      }}
                    </LoadableChartEditor>
                  );
                }}
              </LoadablePlotly>
            );
          }}
        </LoadablePlotlyEditor>
      </>
    );
  }
}

export default connectToProviderData((props) => ({
  provider_url: props.provider_url || props.value?.provider_url,
}))(Edit);
