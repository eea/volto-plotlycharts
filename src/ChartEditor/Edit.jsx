/*
 * A wrapper around the react-chart-editor component.
 */

import React, { useEffect, useMemo, useState, useRef } from 'react';
import { isNil, map, mapValues, cloneDeep, keys } from 'lodash';
import loadable from '@loadable/component';

import { updateChartDataFromProvider } from '@eeacms/volto-datablocks/helpers';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';

import { getDataSources } from '@eeacms/volto-plotlycharts/helpers';

import 'react-chart-editor/lib/react-chart-editor.css';

const LoadablePlotly = loadable.lib(() => import('plotly.js/dist/plotly'));
const LoadablePlotlyEditor = loadable.lib(() => import('./PlotlyEditor'));
const LoadableChartEditor = loadable.lib(() => import('./ChartEditor'));

const config = { editable: false };

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

function getDataSourceOptions(data) {
  return Object.keys(data).map((name) => ({
    value: name,
    label: name,
  }));
}

function getData({ data = [], dataSources, use_data_sources }) {
  const newData =
    dataSources && use_data_sources
      ? updateChartDataFromProvider(data, dataSources)
      : data;

  return map(newData, (trace) => ({
    ...trace,
    ...(trace.type === 'scatterpolar' &&
      trace.connectgaps &&
      trace.mode === 'lines' && {
        r: [...trace.r, trace.r[0]],
        theta: [...trace.theta, trace.theta[0]],
      }),
  }));
}

const Edit = (props) => {
  const plotlyEl = useRef();
  const initialProps = useRef(props);
  const [data, setData] = useState(props.value.chartData?.data || []);

  const filters = useMemo(
    () =>
      (props.value.filters || []).map((filter) => ({
        ...filter,
        data: filter.defaultValue
          ? { label: filter.defaultValue, value: filter.defaultValue }
          : null,
      })),
    [props.value.filters],
  );

  const dataSources = useMemo(
    () =>
      getDataSources({
        provider_data: props.provider_data,
        data_source: props.value.data_source,
      }),
    [props.provider_data, props.value.data_source],
  );

  const filteredDataSources = useMemo(() => {
    if (!filters || filters.length === 0) return dataSources;
    const okIndexes = [];
    const filteredDataSources = cloneDeep(dataSources);
    const firstKey = keys(filteredDataSources)[0];
    (filteredDataSources[firstKey] || []).forEach((_, index) => {
      let ok = true;
      filters.forEach((filter) => {
        if (
          filter.data?.value &&
          filteredDataSources[filter.field] &&
          filteredDataSources[filter.field][index] !== filter.data.value
        ) {
          ok = false;
        }
      });
      if (ok) {
        okIndexes.push(index);
      }
    });
    return mapValues(filteredDataSources, (values) =>
      values.filter((_, index) => okIndexes.includes(index)),
    );
  }, [dataSources, filters]);

  const dataSourceOptions = useMemo(
    () => getDataSourceOptions(dataSources),
    [dataSources],
  );

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
    const data = getData({
      data: props.value.chartData?.data || [],
      dataSources: filteredDataSources,
      use_data_sources: props.value.use_data_sources,
    });
    setData(data);
  }, [
    props.value.use_data_sources,
    props.value.chartData,
    filteredDataSources,
  ]);

  useEffect(() => {
    if (props.value.use_data_sources) {
      props.onChangeValue({
        ...props.value,
        chartData: {
          ...(props.value.chartData || {}),
          data: getData({
            data: props.value.chartData?.data || [],
            dataSources,
            use_data_sources: props.value.use_data_sources,
          }),
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
                          config={config}
                          data={data}
                          layout={props.value.chartData?.layout || {}}
                          frames={props.value.chartData?.frames || []}
                          dataSources={dataSources}
                          dataSourceOptions={dataSourceOptions}
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
                          onUpdateValue={(value) => {
                            props.onChangeValue({
                              ...props.value,
                              ...value,
                            });
                          }}
                          chartHelp={chartHelp}
                          isTemplate={props.isTemplate}
                          fontOptions={[
                            {
                              label: 'Roboto, Sans Serif',
                              value: 'Roboto, sans-serif',
                            },
                            { label: 'Serif', value: 'serif' },
                            { label: 'Monospaced', value: 'monospace' },
                          ]}
                          showFieldTooltips
                          useResizeHandler
                          advancedTraceTypeSelector
                        >
                          <ChartEditor
                            logoSrc=""
                            dataSourceOptions={dataSourceOptions}
                            dataSources={dataSources}
                            {...props}
                          />
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
