/*
 * The most basic connected block chart
 */

import { addAppURL } from '@plone/volto/helpers';
import {
  getConnectedDataParametersForContext,
  getConnectedDataParametersForProvider,
} from 'volto-datablocks/helpers';
import { connect } from 'react-redux';
import { settings } from '~/config';
import React, { useEffect } from 'react'; // , useState
import ResponsiveContainer from '../ResponsiveContainer';
import { getDataFromProvider } from 'volto-datablocks/actions';
import { getChartDataFromVisualization } from 'volto-plotlycharts/actions';

function mixProviderData(chartData, providerData, parameters) {
  const providerDataColumns = Object.keys(providerData);

  const res = chartData.map(trace => {
    Object.keys(trace).forEach(tk => {
      const originalColumn = tk.replace(/src$/, '');
      if (
        tk.endsWith('src') &&
        Object.keys(trace).includes(originalColumn) &&
        typeof trace[tk] === 'string' &&
        providerDataColumns.includes(trace[tk])
      ) {
        let values = providerData[trace[tk]];

        trace[originalColumn] = values;

        if (!(parameters && parameters.length)) return;

        // TODO: we assume a single parameter
        const {
          i: filterName,
          v: [filterValue],
        } = parameters[0];

        // tweak transformation filters using data parameters
        (trace.transforms || []).forEach(transform => {
          if (transform.targetsrc === filterName && filterValue) {
            transform.value = filterValue;
            transform.target = providerData[transform.targetsrc];
          }
        });
      }
    });

    return trace;
  });
  return res;
}

/*
 * @param { object } data The chart data, layout,  extra config, etc.
 * @param { boolean } useLiveData Will update the chart with the data from the provider
 * @param { boolean } filterWithDataParameters Will filter live data with parameters from context
 *
 */
function ConnectedChart(props) {
  // need to bind them in this closure, useEffect depends on them;
  const provider_url =
    props.data.provider_url || props.chartDataFromVis?.provider_url;
  const url = props.data.url;
  const getDataFromProvider = props.getDataFromProvider;
  const getChartDataFromVisualization = props.getChartDataFromVisualization;

  const source_url = props.source;

  const visData = props.chartDataFromVis;

  // NOTE: this is a candidate for a HOC, withProviderData
  useEffect(() => {
    if (source_url && !visData) {
      getChartDataFromVisualization(source_url);
    }
    if (provider_url) getDataFromProvider(provider_url || url);
  }, [
    provider_url,
    visData,
    url,
    source_url,
    props.data,
    getDataFromProvider,
    getChartDataFromVisualization,
  ]);

  // const [visible, setVisible] = useState(false);

  // TODO: decide which one is used props.data.chartData or data?
  // visData: live data fetched from the original visualization
  // data.chartData: saved chart data in the block, from the original edit
  // props.data??? not sure where it's used

  //use visData first to dinamicaly update all visualizations

  const chartData = visData ? visData : props.data.chartData;

  const useLiveData =
    typeof props.useLiveData !== 'undefined' ? props.useLiveData : true;

  const propsLayout = props.data && props.data.layout ? props.data.layout : {};

  let layout = chartData.layout ? chartData.layout : propsLayout;

  let autosize;
  if (typeof props.autosize !== 'undefined') {
    autosize = props.autosize;
  } else if (typeof layout.autosize !== undefined) {
    autosize = layout.autosize;
  } else {
    autosize = true;
  }

  layout = {
    ...layout,
    autosize: true,
    dragmode: false,
    font: {
      ...layout.font,
      family: settings.chartLayoutFontFamily || "'Roboto', sans-serif",
    },
  };

  if (layout.xaxis)
    layout.xaxis = {
      ...layout.xaxis,
      fixedrange: true,
      hoverformat: props.hoverFormatXY || '.3s',
    };
  if (layout.yaxis)
    layout.yaxis = {
      ...layout.yaxis,
      hoverformat: props.hoverFormatXY || '.3s',
      fixedrange: true,
    };

  // TODO: only use fallback data if chartData.data.url doesn't exist
  // or the connected_data_parameters don't exist

  let data =
    props.providerData && useLiveData
      ? mixProviderData(
          chartData.data,
          props.providerData,
          props.connected_data_parameters,
        )
      : chartData.data || [];
  data = data.map(trace => ({
    ...trace,
    textfont: {
      ...trace.textfont,
      family: settings.chartDataFontFamily || "'Roboto', sans-serif",
    },
  }));

  return (
    <React.Fragment>
      {chartData && data && layout && (
        <ResponsiveContainer
          data={data}
          layout={layout}
          frames={chartData.frames || props.data.frames}
          chartConfig={props.data.chartData}
          id={props.id}
          visible={true}
          min_width={props.data?.min_width || props.min_width}
        />
      )}
    </React.Fragment>
  );
}

function getProviderData(state, props, providerForVis) {
  let path =
    providerForVis || props?.data?.provider_url || props?.data?.url || null;

  if (!path) return;

  path = `${path}/@connector-data`;
  const url = `${addAppURL(path)}/@connector-data`;

  const data = state.data_providers?.data || {};
  const res = path ? data[path] || data[url] : [];
  return res;
}

function getVisualizationData(state, props) {
  const vis_url = props.source;
  if (!vis_url) {
    // this is not a visualization derived chart
    return props.data?.chartData;
  }

  return state.chart_data_visualization?.[vis_url]?.item;
}

export default connect(
  (state, props) => {
    const chartDataFromVis = getVisualizationData(state, props);
    const providerData = getProviderData(
      state,
      props,
      chartDataFromVis?.provider_url,
    );

    const providerUrl = props?.data?.provider_url || props?.data?.url || null;
    const url = state.router?.location?.pathname || null;

    const byProvider = getConnectedDataParametersForProvider(
      state.connected_data_parameters,
      providerUrl,
    );
    const byContext = getConnectedDataParametersForContext(
      state.connected_data_parameters,
      url,
    );

    return {
      providerData,
      chartDataFromVis,
      connected_data_parameters:
        providerUrl !== null ? byProvider || byContext : byContext,
    };
  },
  { getDataFromProvider, getChartDataFromVisualization }, // getContent,
)(ConnectedChart);
