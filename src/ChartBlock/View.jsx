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

function ChartView(props) {
  // console.log('chartview props', props);

  useEffect(() => {
    props.getDataFromProvider(props.data.url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data.url]);

  const chartData = props.data.chartData;
  return (
    <div className="chartWrapperView">
      <div className="block-inner-wrapper">
        <LoadablePlot
          data={
            props.providerData
              ? mixProviderData(
                  chartData.data,
                  props.providerData,
                  props.connected_data_parameters,
                )
              : chartData.data || []
          }
          layout={chartData.layout}
          frames={chartData.frames}
          config={{ displayModeBar: false }}
        />
      </div>
    </div>
  );
}

function getProviderData(state, props) {
  let path = props?.data?.url || null;

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
)(ChartView);
