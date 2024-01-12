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

import { getDataSources } from '@eeacms/volto-plotlycharts/helpers';

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

async function initEditor(el, editor, dflt, schema) {
  const jsoneditor = await import('jsoneditor');
  const JSONEditor = jsoneditor.default;
  // create the editor
  const container = document.getElementById(el);

  if (!container) {
    return;
  }

  container.innerHTML = '';

  const options = {
    mode: 'code',
    schema: schema || {
      type: 'array',
      items: {
        type: 'object',
      },
    },
  };

  editor.current = new JSONEditor(container, options);
  // set initial json
  editor.current.set(dflt);
}

function destroyEditor(editor) {
  if (editor) {
    editor.destroy();
    editor = null;
  }
}

async function validate(editor) {
  const err = await editor.current.validate();

  if (err.length) {
    toast.warn(
      <Toast
        error
        title={'JSON validation'}
        content={'Please make sure all the fields are in the correct format'}
      />,
    );
    return false;
  }

  return true;
}

const TabEditData = (props) => {
  const editor = useRef();
  const initialData = useRef(props.value.chartData?.data || []);

  useEffect(() => {
    initEditor('jsoneditor-data', editor, initialData.current);

    const editorCurr = editor.current;

    return () => {
      destroyEditor(editorCurr);
    };
  }, []);

  useEffect(() => {
    if (editor.current && props.value.use_live_data) {
      editor.current.set(props.liveData);
    }
  }, [props.value.use_live_data, props.liveData]);

  return (
    <Tab.Pane style={paneStyle}>
      <Checkbox
        label="Use live data"
        checked={props.value.use_live_data}
        onChange={(_, data) => {
          props.onChangeValue({
            ...props.value,
            use_live_data: data.checked,
          });
        }}
        toggle
      />
      <Button
        style={{ padding: '10px 20px', margin: '10px 0' }}
        primary
        onClick={async () => {
          const isValid = await validate(editor);
          if (!isValid) return;
          try {
            props.onChangeValue({
              ...props.value,
              use_live_data: false,
              chartData: {
                ...(props.value.chartData || {}),
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
      <div id="jsoneditor-data" style={{ width: '100%', height: '100%' }} />
    </Tab.Pane>
  );
};

const TabEditLayout = (props) => {
  const editor = useRef();
  const initialLayout = useRef(props.value.chartData?.layout || {});

  useEffect(() => {
    initEditor('jsoneditor-layout', editor, initialLayout.current, {
      type: 'object',
    });

    const editorCurr = editor.current;

    return () => {
      destroyEditor(editorCurr);
    };
  }, []);

  return (
    <Tab.Pane style={paneStyle}>
      <Button
        style={{ padding: '10px 20px', margin: '10px 0' }}
        primary
        onClick={async () => {
          const isValid = await validate(editor);
          if (!isValid) return;
          try {
            props.onChangeValue({
              ...props.value,
              chartData: {
                ...(props.value.chartData || {}),
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
      <div id="jsoneditor-layout" style={{ width: '100%', height: '100%' }} />
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
  const initialProps = useRef(props);
  const [dataSources, setDataSources] = useState(() =>
    getDataSources({
      provider_data: props.provider_data,
      json_data: props.value.json_data,
    }),
  );
  const [data, setData] = useState(props.value.chartData?.data || []);

  const dataSourceOptions = useMemo(() => getDataSourceOptions(dataSources), [
    dataSources,
  ]);

  const liveData = useMemo(() => {
    return updateChartDataFromProvider(
      props.value.chartData?.data || [],
      dataSources,
    );
    /* eslint-disable-next-line */
  }, [props.value.chartData?.data, dataSources]);

  useEffect(() => {
    LoadablePlotly.preload();
    LoadablePlotlyEditor.preload();
    LoadableChartEditor.preload();

    if (isNil(initialProps.current.value.use_live_data)) {
      initialProps.current.onChangeValue({
        ...initialProps.current.value,
        use_live_data: true,
      });
    }
  }, []);

  useEffect(() => {
    setDataSources(
      getDataSources({
        provider_data: props.provider_data,
        json_data: props.value.json_data,
      }),
    );
    /* eslint-disable-next-line */
  }, [props.provider_data, props.value.json_data]);

  useEffect(() => {
    setData(
      (props.value.use_live_data
        ? liveData
        : props.value.chartData?.data || []
      ).map((trace) => ({
        ...trace,
        ...(trace.type === 'scatterpolar' &&
          trace.connectgaps &&
          trace.mode === 'lines' && {
            r: [...trace.r, trace.r[0]],
            theta: [...trace.theta, trace.theta[0]],
          }),
      })),
    );
    /* eslint-disable-next-line */
  }, [props.value.use_live_data, props.value.chartData?.data, liveData]);

  useEffect(() => {
    if (props.value.use_live_data) {
      props.onChangeValue({
        ...props.value,
        chartData: {
          ...(props.value.chartData || {}),
          data: liveData,
        },
      });
    }
    /* eslint-disable-next-line */
  }, [props.value.use_live_data]);

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
                                ...(props.value.chartData || {}),
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
                              <RawDataEditor {...props} liveData={liveData} />
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
