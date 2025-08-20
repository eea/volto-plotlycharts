/*
 * The most basic connected block chart
 */

import React from 'react';
import { compose } from 'redux';
import loadable from '@loadable/component';
import config from '@plone/volto/registry';
import { connectToProviderData } from '@eeacms/volto-datablocks/hocs';
import { VisibilitySensor } from '@eeacms/volto-datablocks/components';

const PlotlyComponent = loadable(() =>
  import('@eeacms/volto-plotlycharts/lib/react-plotly'),
);

/*
 * @param { object } data The chart data, layout,  extra config, etc.
 * @param { boolean } useLiveData Will update the chart with the data from the provider
 * @param { boolean } filterWithDataParameters Will filter live data with parameters from context
 *
 */
function Treemap(props) {
  const layout = {
    autosize: true,
    dragmode: false,
    font: {
      family: config.settings.chartLayoutFontFamily || "'Roboto', sans-serif",
    },
    margin: { b: 10, l: 10, pad: 0, r: 10, t: 10 },
  };

  let { provider_data = {}, data = {} } = props;
  const { size_column, parent_column, label_column } = data;

  provider_data = provider_data || {};

  let traces = [
    {
      type: 'treemap',
      labels: provider_data[label_column] || [],
      parents: provider_data[parent_column] || [],
      values: provider_data[size_column] || [],
      marker: {
        pad: {
          // t: 100,
        },
      },
    },
  ];

  return (
    <div className="treemap-chart">
      <VisibilitySensor>
        <div className="visualization">
          <PlotlyComponent
            data={traces}
            layout={layout}
            frames={[]}
            config={{
              displayModeBar: false,
              editable: false,
              responsive: true,
              useResizeHandler: true,
            }}
            style={{
              width: '100%',
              height: '450px',
              margin: 'auto',
            }}
          />
        </div>
      </VisibilitySensor>
    </div>
  );
}

export default compose(
  connectToProviderData((props) => ({
    provider_url: props.data.url || props.data.provider_url,
  })),
)(Treemap);
