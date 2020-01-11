/*
 * The most basic connected block chart
 */

import { addAppURL } from '@plone/volto/helpers';
import { getDataFromProvider } from 'volto-datablocks/actions';
import { getConnectedDataParameters } from 'volto-datablocks/helpers';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';
import React, { useEffect } from 'react';

const LoadablePlot = Loadable({
  loader: () => import('react-plotly.js'),
  loading() {
    return <div>Loading chart...</div>;
  },
});

function mixProviderData(chartData, providerData, parameters) {
  const providerDataColumns = Object.keys(providerData);
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
  // console.log('chartview props', props);
  //
  // need to bind them in this closure, useEffect depends on them;
  const provider_url = props.data.provider_url;
  const url = props.data.url;
  const getDataFromProvider = props.getDataFromProvider;

  // NOTE: this is a candidate for a HOC, withProviderData
  useEffect(() => {
    provider_url && getDataFromProvider(provider_url || url);
  }, [getDataFromProvider, provider_url, url]);

  // TODO: decide which one is used props.data.chartData or data?
  const chartData = props.data.chartData || props.data;

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
    autosize,
  };

  const data =
    props.providerData && useLiveData
      ? mixProviderData(
          chartData.data,
          props.providerData,
          props.connected_data_parameters,
        )
      : chartData.data || [];

  // Pass additional configs in chartData if you want:
  // const chartData = {
  //          config:{{ displayModeBar: false }}
  //          data: [],
  //          layout: {},
  //          frames: []
  // }
  return (
    <LoadablePlot
      {...props.data.chartData}
      data={data}
      layout={layout}
      frames={chartData.frames || props.data.frames}
    />
  );
}

function getProviderData(state, props) {
  let path = props?.data?.provider_url || props?.data?.url || null;

  if (!path) return;

  path = `${path}/@connector-data`;
  const url = `${addAppURL(path)}/@connector-data`;

  const data = state.data_providers.data || {};
  const res = path ? data[path] || data[url] : [];
  return res;
}

export default connect(
  (state, props) => {
    const providerData = getProviderData(state, props);
    const url = state.router?.location?.pathname || null;

    return {
      providerData,
      connected_data_parameters:
        url !== null ? getConnectedDataParameters(state, { url }) : null,
    };
  },
  { getDataFromProvider },
)(ConnectedChart);
