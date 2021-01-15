/*
 * The most basic connected block chart
 */

import React from 'react';
import { compose } from 'redux';
import { connectAnythingToProviderData } from 'volto-datablocks/hocs';
import loadable from '@loadable/component';
import {
  mixProviderData,
  connectToDataParameters,
} from 'volto-datablocks/helpers';
import { Placeholder } from 'volto-datablocks/components';

import { settings } from '~/config';

import './fixes.css';

const LoadableBasicPlotly = loadable.lib(() =>
  import('plotly.js/lib/index-basic'),
);
const LoadableCartesianPlotly = loadable.lib(() =>
  import('plotly.js/lib/index-cartesian'),
);
const LoadableGeoPlotly = loadable.lib(() => import('plotly.js/lib/index-geo'));
const LoadableGl3dPlotly = loadable.lib(() =>
  import('plotly.js/lib/index-gl3d'),
);
const LoadableGl2dPlotly = loadable.lib(() =>
  import('plotly.js/lib/index-gl2d'),
);
const LoadableMapboxPlotly = loadable.lib(() =>
  import('plotly.js/lib/index-mapbox'),
);
const LoadableFinancePlotly = loadable.lib(() =>
  import('plotly.js/lib/index-finance'),
);
// const LoadablePlot = loadable(() =>
//   import(
//     /* webpackChunkName: "bise-react-plotly" */
//     'react-plotly.js'
//   ),
// );

const plotlyMappings = {
  basic: LoadableBasicPlotly,
  cartesian: LoadableCartesianPlotly,
  geo: LoadableGeoPlotly,
  gl3d: LoadableGl3dPlotly,
  gl2d: LoadableGl2dPlotly,
  mapbox: LoadableMapboxPlotly,
  finance: LoadableFinancePlotly,
};

/**
 * basic:       scatter, bar and pie
 * cartesian:   scatter, bar, box, heatmap, histogram, histogram2d, histogram2dcontour, image, pie, contour, scatterternary and violin
 * geo:         scatter, scattergeo and choropleth
 * gl3d:        scatter, scatter3d, surface, mesh3d, isosurface, volume, cone and streamtube
 * gl2d:        scatter, scattergl, splom, pointcloud, heatmapgl, contourgl and parcoords
 * mapbox:      scatter, scattermapbox, choroplethmapbox and densitymapbox
 * finance:     scatter, bar, histogram, pie, funnelarea, ohlc, candlestick, funnel, waterfall and indicator
 */

// TODO: make sure the partials here are in order of bundle size, ascending
const partials = [
  { name: 'basic', traces: ['scatter', 'bar', 'pie'] },
  {
    name: 'cartesian',
    traces: [
      'scatter',
      'bar',
      'box',
      'heatmap',
      'histogram',
      'histogram2d',
      'histogram2dcontour',
      'image',
      'pie',
      'contour',
      'scatterternary',
      'violin',
    ],
  },
  { name: 'geo', traces: ['scatter', 'scattergeo', 'choropleth'] },
  {
    name: 'gl3d',
    traces: [
      'scatter',
      'scatter3d',
      'surface',
      'mesh3d',
      'isosurface',
      'volume',
      'cone',
      'streamtube',
    ],
  },
  {
    name: 'gl2d',
    traces: [
      'scatter',
      'scattergl',
      'splom',
      'pointcloud',
      'heatmapgl',
      'contourgl',
      'parcoords',
    ],
  },
  {
    name: 'mapbox',
    traces: ['scatter', 'scattermapbox', 'choroplethmapbox', 'densitymapbox'],
  },
  {
    name: 'finance',
    traces: [
      'scatter',
      'bar',
      'histogram',
      'pie',
      'funnelarea',
      'ohlc',
      'candlestick',
      'funnel',
      'waterfall',
      'indicator',
    ],
  },
];

const getPartialNameForTraceType = (tt) => {
  const findings = partials.filter((x) => {
    return x.traces.includes(tt);
  });
  if (findings.length === 0) {
    return partials[partials.length - 1].name;
  }
  return findings[0].name;
};

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
      family: settings.chartLayoutFontFamily || "'Roboto', sans-serif",
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
      family: settings.chartDataFontFamily || "'Roboto', sans-serif",
    },
  }));

  // console.log('DATA', getPartialNameForTraceType(data[0].type));

  // TODO: load all above, in the file header, they are lazy loaded actually anyway
  const LoadablePlotly =
    plotlyMappings[/* 'cartesian' */ getPartialNameForTraceType(data[0]?.type)]; // loadable.lib(() =>
  // import(`plotly.js/lib/index-${getPartialNameForTraceType(data[0].type)}`),
  // );

  return (
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
            <LoadablePlotly>
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
            </LoadablePlotly>
          </div>
        )}
      </Placeholder>
    </div>
  );
}

export default compose(
  connectAnythingToProviderData(
    // injects provider_data
    (props) => props.data.url || props.data.provider_url,
  ),
  connectToDataParameters,
)(ConnectedChart);
