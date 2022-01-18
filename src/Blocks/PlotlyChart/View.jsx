import React from 'react';
import ConnectedChart from '@eeacms/volto-plotlycharts/ConnectedChart';

import '@eeacms/volto-plotlycharts/less/visualization.less';

const View = (props) => {
  const { data = {} } = props;
  const { visualization = {} } = data;

  return (
    <div className="plotly-chart">
      <ConnectedChart
        data={{
          data_query: data.data_query,
          chartSources: data.chartSources,
          download_button: data.download_button,
          provider_url: visualization.provider_url,
        }}
        hoverFormatXY={data.hover_format_xy}
        visualization={visualization}
        withSources={true}
        width={data.width}
        height={data.height}
      />
    </div>
  );
};

export default View;
