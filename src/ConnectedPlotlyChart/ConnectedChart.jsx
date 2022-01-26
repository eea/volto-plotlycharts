/*
 * The most basic connected block chart
 */

import React from 'react';
import { compose } from 'redux';
import { connectAnythingToProviderData } from '@eeacms/volto-datablocks/hocs';
import loadable from '@loadable/component';
import {
  mixProviderData,
  connectToDataParameters,
} from '@eeacms/volto-datablocks/helpers';
import { Placeholder } from '@eeacms/volto-datablocks/components';
import { Placeholder as ImagePlaceholder } from 'semantic-ui-react';

import config from '@plone/volto/registry';

import './fixes.css';

const LoadableCartesianPlotly = loadable.lib(() =>
  import(
    /* webpackChunkName: "plotly-cartesian" */ 'plotly.js/dist/plotly-cartesian'
  ),
);

const LoadableReactPlotly = loadable.lib(() =>
  import('react-plotly.js/factory'),
);

/*
 * @param { object } data The chart data, layout,  extra config, etc.
 * @param { boolean } useLiveData Will update the chart with the data from the provider
 * @param { boolean } filterWithDataParameters Will filter live data with parameters from context
 *
 */
function ConnectedChart(props) {
  // console.log('connectedchart', props);
  const chartData = props.data.chartData;
  const useLiveData =
    typeof props.useLiveData !== 'undefined' ? props.useLiveData : true;

  const propsLayout = props.data && props.data.layout ? props.data.layout : {};

  let layout = chartData?.layout ? chartData.layout : propsLayout;

  layout = {
    ...layout,
    autosize: true,
    dragmode: false,
    font: {
      ...layout.font,
      family: config.settings.chartLayoutFontFamily || "'Roboto', sans-serif",
    },
    margin: {
      l: 40, // default: 80
      r: 40, // default: 80
      b: 40, // default: 80
      t: 50, // default: 100
    },
  };

  if (layout.xaxis)
    layout.xaxis = {
      ...layout.xaxis,
      fixedrange: true,
      hoverformat: props.hoverFormatXY || '.2f',
    };
  if (layout.yaxis)
    layout.yaxis = {
      ...layout.yaxis,
      hoverformat: props.hoverFormatXY || '.2f',
      fixedrange: true,
    };

  // TODO: only use fallback data if chartData.data.url doesn't exist
  // or the connected_data_parameters don't exist
  // console.log('connected chart', props);

  let data =
    props.provider_data && useLiveData
      ? mixProviderData(
          (chartData || {}).data,
          props.provider_data,
          props.connected_data_parameters,
        )
      : (chartData || {}).data || [];
  //
  // console.log('data after mix', data);

  data = data.map((trace) => ({
    ...trace,
    textfont: {
      ...trace.textfont,
      family: config.settings.chartDataFontFamily || "'Roboto', sans-serif",
    },
  }));

  return __CLIENT__ ? (
    <div>
      {/* {JSON.stringify(data)} */}
      <Placeholder
        getDOMElement={(val) => {
          return val?.el;
        }}
        className="connected-chart"
        partialVisibility={true}
        offset={{ top: -100, bottom: -100 }}
        delayedCall={true}
      >
        {({ nodeRef }) => (
          <div className="connected-chart-wrapper">
            <LoadableCartesianPlotly>
              {(Plotly) => {
                return (
                  <LoadableReactPlotly>
                    {({ default: createPlotlyComponent }) => {
                      const Plot = createPlotlyComponent(Plotly);
                      return (
                        <Plot
                          ref={nodeRef}
                          data={data}
                          layout={layout}
                          frames={[]}
                          config={{
                            displayModeBar: false,
                            editable: false,
                            responsive: true,
                            useResizeHandler: true,
                          }}
                          style={{
                            maxWidth: '100%',
                            margin: 'auto',
                          }}
                        />
                      );
                    }}
                  </LoadableReactPlotly>
                );
              }}
            </LoadableCartesianPlotly>
          </div>
        )}
      </Placeholder>
    </div>
  ) : (
    <ImagePlaceholder>
      <ImagePlaceholder.Image rectangular />
    </ImagePlaceholder>
  );
}

export default compose(
  connectAnythingToProviderData(
    // injects provider_data
    (props) => props.data.url || props.data.provider_url,
  ),
  connectToDataParameters,
)(ConnectedChart);
