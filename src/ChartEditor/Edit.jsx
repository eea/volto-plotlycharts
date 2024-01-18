/*
 * A wrapper around the react-chart-editor component.
 */

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { isNil } from 'lodash';
import { Tab, Button, Checkbox } from 'semantic-ui-react';
import loadable from '@loadable/component';
import { toast } from 'react-toastify';
import { Toast } from '@plone/volto/components';

import { updateChartDataFromProvider } from '@eeacms/volto-datablocks/helpers';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';

import {
  getDataSources,
  initEditor,
  destroyEditor,
  validateEditor,
  onPasteEditor,
} from '@eeacms/volto-plotlycharts/helpers';

import 'react-chart-editor/lib/react-chart-editor.css';

const LoadablePlotly = loadable.lib(() => import('plotly.js/dist/plotly'));
const LoadablePlotlyEditor = loadable.lib(() => import('react-chart-editor'));
const LoadableChartEditor = loadable.lib(() => import('./ChartEditor'));

const config = { editable: true };

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

const paneStyle = {
  flexGrow: 1,
  display: 'flex',
  flexFlow: 'column',
};

function getDataSourceOptions(data) {
  return Object.keys(data).map((name) => ({
    value: name,
    label: name,
  }));
}

const TabEditData = (props) => {
  const editor = useRef();
  const initialData = useRef(props.chartData.data || []);

  useEffect(() => {
    initEditor({
      el: 'jsoneditor-data',
      editor,
      dflt: initialData.current,
    });

    const editorCurr = editor.current;

    return () => {
      destroyEditor(editorCurr);
    };
  }, []);

  useEffect(() => {
    if (!editor.current) return;
    editor.current.set(props.chartData.data);
  }, [props.chartData.data]);

  return (
    <Tab.Pane style={paneStyle}>
      <Checkbox
        label="Use data sources"
        checked={props.value.use_data_sources}
        onChange={(_, data) => {
          props.onChangeValue({
            ...props.value,
            use_data_sources: data.checked,
          });
        }}
        toggle
      />
      <Button
        style={{ padding: '10px 20px', margin: '10px 0' }}
        primary
        onClick={async () => {
          const isValid = await validateEditor(editor);
          if (!isValid) return;
          try {
            props.onChangeValue({
              ...props.value,
              use_data_sources: false,
              chartData: {
                ...props.chartData,
                data: editor.current.get(),
              },
            });
          } catch (error) {
            toast.error(
              <Toast error title={'JSON error'} content={error.message} />,
            );
          }
        }}
      >
        Save
      </Button>
      <div
        id="jsoneditor-data"
        style={{ width: '100%', height: '100%' }}
        onPaste={(e) => {
          onPasteEditor(editor);
        }}
      />
    </Tab.Pane>
  );
};

const TabEditLayout = (props) => {
  const editor = useRef();
  const initialLayout = useRef(props.chartData.layout || {});

  useEffect(() => {
    initEditor({
      el: 'jsoneditor-layout',
      editor,
      dflt: initialLayout.current,
      options: {
        schema: {
          type: 'object',
        },
      },
    });

    const editorCurr = editor.current;

    return () => {
      destroyEditor(editorCurr);
    };
  }, []);

  useEffect(() => {
    if (!editor.current) return;
    editor.current.set(props.chartData.layout);
  }, [props.chartData.layout]);

  return (
    <Tab.Pane style={paneStyle}>
      <Button
        style={{ padding: '10px 20px', margin: '10px 0' }}
        primary
        onClick={async () => {
          const isValid = await validateEditor(editor);
          if (!isValid) return;
          try {
            props.onChangeValue({
              ...props.value,
              chartData: {
                ...props.chartData,
                layout: editor.current.get(),
              },
            });
          } catch (error) {
            toast.error(
              <Toast error title={'JSON error'} content={error.message} />,
            );
          }
        }}
      >
        Save
      </Button>
      <div
        id="jsoneditor-layout"
        style={{ width: '100%', height: '100%' }}
        onPaste={(e) => {
          onPasteEditor(editor);
        }}
      />
    </Tab.Pane>
  );
};

const RawDataEditor = (props) => {
  const panes = [
    {
      menuItem: 'Data',
      render: () => <TabEditData {...props} />,
    },
    {
      menuItem: 'Layout',
      render: () => <TabEditLayout {...props} />,
    },
  ];

  return (
    <Tab
      style={{
        height: '100%',
        display: 'flex',
        flexFlow: 'column',
      }}
      menu={{ secondary: true, pointing: true }}
      panes={panes}
    />
  );
};

const Edit = (props) => {
  const plotlyEl = useRef();
  const initialProps = useRef(props);
  const [dataSources, setDataSources] = useState(() =>
    getDataSources({
      provider_data: props.provider_data,
      data_source: props.value.data_source,
    }),
  );
  const [data, setData] = useState(props.value.chartData?.data || []);

  const chartData = useMemo(() => props.value.chartData || {}, [
    props.value.chartData,
  ]);

  const dataSourceOptions = useMemo(() => getDataSourceOptions(dataSources), [
    dataSources,
  ]);

  const liveData = useMemo(() => {
    return updateChartDataFromProvider(chartData.data || [], dataSources);
  }, [chartData.data, dataSources]);

  useEffect(() => {
    LoadablePlotly.preload();
    LoadablePlotlyEditor.preload();
    LoadableChartEditor.preload();

    if (isNil(initialProps.current.value.use_data_sources)) {
      initialProps.current.onChangeValue({
        ...initialProps.current.value,
        use_data_sources: true,
      });
    }
  }, []);

  useEffect(() => {
    setDataSources(
      getDataSources({
        provider_data: props.provider_data,
        data_source: props.value.data_source,
      }),
    );
  }, [props.provider_data, props.value.data_source]);

  useEffect(() => {
    setData(
      (props.value.use_data_sources ? liveData : chartData.data || []).map(
        (trace) => ({
          ...trace,
          ...(trace.type === 'scatterpolar' &&
            trace.connectgaps &&
            trace.mode === 'lines' && {
              r: [...trace.r, trace.r[0]],
              theta: [...trace.theta, trace.theta[0]],
            }),
        }),
      ),
    );
  }, [props.value.use_data_sources, chartData.data, liveData]);

  useEffect(() => {
    if (props.value.use_data_sources) {
      props.onChangeValue({
        ...props.value,
        chartData: {
          ...chartData,
          data: liveData,
        },
      });
    }
    /* eslint-disable-next-line */
  }, [props.value.use_data_sources]);

  if (__SERVER__) return '';

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
                          ref={plotlyEl}
                          divId="gd"
                          config={config}
                          data={data}
                          layout={props.value.chartData?.layout || {}}
                          frames={props.value.chartData?.frames || []}
                          dataSourceOptions={dataSourceOptions}
                          dataSources={dataSources}
                          plotly={plotly}
                          onUpdate={(data, layout, frames) => {
                            props.onChangeValue({
                              ...props.value,
                              chartData: {
                                data,
                                layout,
                                frames,
                              },
                            });
                          }}
                          chartHelp={chartHelp}
                          showFieldTooltips
                          useResizeHandler
                          advancedTraceTypeSelector
                        >
                          <ChartEditor
                            onChangeValue={props.onChangeValue}
                            value={props.value}
                            logoSrc=""
                          >
                            <Panel
                              group="Advanced"
                              name="Raw editor"
                              style={{ height: '100%' }}
                            >
                              <RawDataEditor {...props} chartData={chartData} />
                            </Panel>
                          </ChartEditor>
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
};

export default connectToProviderData((props) => ({
  provider_url: props.provider_url || props.value?.provider_url,
}))(Edit);
