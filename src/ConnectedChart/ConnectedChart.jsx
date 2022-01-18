/*
 * The most basic connected block chart
 */

import React from 'react';
import { compose } from 'redux';
import loadable from '@loadable/component';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import { updateChartDataFromProvider } from '@eeacms/volto-datablocks/helpers';
import { Sources } from '@eeacms/volto-datablocks/Utils';
import { connectBlockToVisualization } from '../hocs';

import config from '@plone/volto/registry';

const LoadablePlotly = loadable(() => import('react-plotly.js'));

/*
 * @param { object } data The chart data, layout,  extra config, etc.
 * @param { boolean } useLiveData Will update the chart with the data from the provider
 * @param { boolean } filterWithDataParameters Will filter live data with parameters from context
 *
 */
function ConnectedChart(props) {
  const {
    hoverFormatXY,
    loadingVisualizationData,
    provider_data,
    visualization,
    visualization_data,
    width,
    height = 450,
  } = props;

  const chartData =
    visualization?.chartData || visualization_data?.chartData || {};

  const layout = {
    ...(chartData.layout || {}),
    autosize: true,
    dragmode: false,
    font: {
      ...(chartData.layout?.font || {}),
      family: config.settings.chartLayoutFontFamily || "'Roboto', sans-serif",
    },
    margin: {
      l: 80, // default: 80
      r: 80, // default: 80
      b: 80, // default: 80
      t: 100, // default: 100
    },
  };

  delete layout.width;
  delete layout.height;

  if (layout.xaxis)
    layout.xaxis = {
      ...layout.xaxis,
      autorange: true,
      hoverformat: hoverFormatXY || '.3s',
    };
  if (layout.yaxis)
    layout.yaxis = {
      ...layout.yaxis,
      autorange: true,
      hoverformat: hoverFormatXY || '.3s',
    };

  const useLiveData =
    typeof props.useLiveData !== 'undefined' ? props.useLiveData : true;

  let data =
    provider_data && useLiveData
      ? updateChartDataFromProvider(chartData.data, provider_data)
      : chartData.data || [];

  data = data.map((trace) => ({
    ...trace,
    textfont: {
      ...trace.textfont,
      family: config.settings.chartDataFontFamily || "'Roboto', sans-serif",
    },
  }));

  if (loadingVisualizationData || props.isPending) {
    return <div>Loading chart...</div>;
  }

  return !Object.keys(chartData).length ? (
    <div>No valid data.</div>
  ) : (
    <>
      <div className="connected-chart-wrapper">
        <LoadablePlotly
          data={data}
          layout={layout}
          frames={[]}
          config={{
            displayModeBar: false,
            editable: false,
            responsive: true,
          }}
          style={{
            width: width ? width + 'px' : '100%',
            height: height + 'px',
          }}
        />
      </div>
      {props.withSources ? (
        <Sources
          data={{ data_query: props.data.data_query }}
          sources={props.data.chartSources}
          provider_url={
            props.visualization?.provider_url ||
            props.visualization_data?.provider_url ||
            props.data?.provider_url
          }
          download_button={props.data.download_button}
        />
      ) : (
        ''
      )}
    </>
  );
}

export default compose(
  connectBlockToVisualization,
  connectToProviderData((props) => ({
    provider_url:
      props.visualization?.provider_url ||
      props.visualization_data?.provider_url ||
      props.data?.provider_url,
  })),
)(ConnectedChart);
