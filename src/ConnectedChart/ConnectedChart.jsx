/*
 * The most basic connected block chart
 */

import React from 'react';
import { compose } from 'redux';
import loadable from '@loadable/component';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import { updateChartDataFromProvider } from '@eeacms/volto-datablocks/helpers';
import { Sources } from '@eeacms/volto-datablocks/Utils';
import { connectBlockToVisualization } from '@eeacms/volto-plotlycharts/hocs';

import config from '@plone/volto/registry';

const LoadablePlotly = loadable(() => import('react-plotly.js'));

/*
 * ConnectedChart
 */
function ConnectedChart(props) {
  const {
    hoverFormatXY,
    loadingProviderData,
    loadingVisualizationData,
    provider_data,
    provider_metadata,
    visualization,
    visualization_data,
    width,
    height = 450,
  } = props;

  const use_live_data = props.data?.use_live_data ?? true;
  const with_sources = props.data?.with_sources ?? true;

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

  let data =
    provider_data && use_live_data
      ? updateChartDataFromProvider(chartData.data, provider_data)
      : chartData.data || [];

  data = data.map((trace) => ({
    ...trace,
    textfont: {
      ...trace.textfont,
      family: config.settings.chartDataFontFamily || "'Roboto', sans-serif",
    },
  }));

  if (loadingVisualizationData) {
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
      {with_sources && props.data ? (
        <Sources
          data={{ data_query: props.data.data_query }}
          sources={props.data.chartSources}
          title={props.data?.vis_url}
          provider_data={provider_data}
          provider_metadata={provider_metadata}
          download_button={props.data.download_button}
        />
      ) : (
        ''
      )}
    </>
  );
}

export default compose(
  connectBlockToVisualization((props) => ({
    vis_url: props.data?.vis_url || null,
    use_live_data: props.data?.use_live_data ?? true,
  })),
  connectToProviderData((props) => {
    const use_live_data = props.data?.use_live_data ?? true;
    if (!use_live_data) return {};
    return {
      provider_url:
        props.visualization?.provider_url ||
        props.visualization_data?.provider_url ||
        props.data?.provider_url,
    };
  }),
)(ConnectedChart);
