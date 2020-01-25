/*
 * The most basic connected block chart
 */

import { addAppURL } from '@plone/volto/helpers';
import { getContent } from '@plone/volto/actions';
import { getDataFromProvider } from 'volto-datablocks/actions';
import {
  getConnectedDataParametersForContext,
  getConnectedDataParametersForProvider,
} from 'volto-datablocks/helpers';
import { connect } from 'react-redux';
import { settings } from '~/config';
import React, { useEffect, useState } from 'react';
import ResponsiveContainer from '../ResponsiveContainer';
import VisibilitySensor from 'react-visibility-sensor';

function mixProviderData(chartData, providerData, parameters) {
  const providerDataColumns = Object.keys(providerData);
  // console.log('chartData', chartData);
  // console.log('providerData', providerData);
  // console.log('parameters', parameters);

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

        // if (originalColumn === 'labels') values = values.map(l => l + 'LLL');

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
            // console.log('trace', transform, filterValue);
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

  const source_url = props.source;
  const getContent = props.getContent;

  // console.log('provider_url', provider_url);

  // NOTE: this is a candidate for a HOC, withProviderData
  useEffect(() => {
    source_url && getContent(source_url, null, source_url);
    provider_url && getDataFromProvider(provider_url || url);
  }, [getDataFromProvider, provider_url, url, source_url, getContent]);

  const [visible, setVisible] = useState(false);

  // TODO: decide which one is used props.data.chartData or data?
  // chartDataFromVis: live data fetched from the original visualization
  // data.chartData: saved chart data in the block, from the original edit
  // props.data??? not sure where it's used
  const chartData =
    props.chartDataFromVis || props.data.chartData || props.data;

  const useLiveData =
    typeof props.useLiveData !== 'undefined' ? props.useLiveData : true;

  let layout = chartData.layout || props.data.layout || {};
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
    font: {
      ...layout.font,
      family: settings.chartLayoutFontFamily || "'Roboto', sans-serif",
    },
  };

  if (layout.xaxis) layout.xaxis = { ...layout.xaxis, range: [] };
  if (layout.yaxis) layout.yaxis = { ...layout.yaxis, range: [] };

  console.debug('chart props', props);
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

  // Pass additional configs in chartData if you want:
  // const chartConfig={{ config:{ displayModeBar: false } }}
  //
  // console.log('connected data parameters', props.connected_data_parameters);
  // console.log('chart data', data);
  // console.log('chart layout', layout);

  return (
    <VisibilitySensor partialVisibility={true} onChange={setVisible}>
      <ResponsiveContainer
        data={data}
        layout={layout}
        frames={chartData.frames || props.data.frames}
        chartConfig={props.data.chartData}
        id={props.id}
        visible={visible}
      >
        {/* <LoadablePlot /> */}
      </ResponsiveContainer>
    </VisibilitySensor>
  );
}

function getProviderData(state, props, providerForVis) {
  let path =
    providerForVis || props?.data?.provider_url || props?.data?.url || null;

  // console.log('getProviderData props', props);
  // console.log('getProviderData path', path);
  if (!path) return;

  path = `${path}/@connector-data`;
  const url = `${addAppURL(path)}/@connector-data`;

  const data = state.data_providers.data || {};
  const res = path ? data[path] || data[url] : [];
  return res;
}

function getVisualizationData(state, props) {
  const vis_url = props.source;
  const res = vis_url
    ? state.content.subrequests?.[vis_url]?.data?.visualization
    : null;
  return res;
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
      state,
      providerUrl,
    );
    const byContext = getConnectedDataParametersForContext(state, url);

    return {
      providerData,
      chartDataFromVis,
      connected_data_parameters:
        providerUrl !== null ? byProvider || byContext : byContext,
    };
  },
  { getDataFromProvider, getContent },
)(ConnectedChart);
