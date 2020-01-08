import { addAppURL } from '@plone/volto/helpers';
import { getDataFromProvider } from 'volto-datablocks/actions';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';
import React, { useEffect } from 'react';

const LoadablePlot = Loadable({
  loader: () => import('react-plotly.js'),
  loading() {
    return <div>Loading chart...</div>;
  },
});

function mixProviderData(chartData, providerData) {
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
        // console.log('replacing', originalColumn, tk, trace[tk]);
        let values = providerData[trace[tk]];

        // if (originalColumn === 'labels') values = values.map(l => l + 'XXX');

        trace[originalColumn] = values;
      }
    });

    return trace;
  });
  // console.log('new chartData', res);
  return res;
}

function ChartView(props) {
  // console.log(props);

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
              ? mixProviderData(chartData.data, props.providerData)
              : chartData.data
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
  // console.log('url in getProviderData', path, state);

  if (!path) return;

  path = `${path}/@connector-data`;
  const url = `${addAppURL(path)}/@connector-data`;

  const data = state.data_providers.data || {};
  const res = path ? data[path] || data[url] : [];
  // console.log('res', res);
  return res;
}

export default connect(
  (state, props) => {
    const providerData = getProviderData(state, props);

    return {
      providerData,
    };
  },
  { getDataFromProvider },
)(ChartView);
