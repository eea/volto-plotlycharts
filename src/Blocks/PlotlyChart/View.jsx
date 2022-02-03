import React from 'react';
import ConnectedChart from '@eeacms/volto-plotlycharts/ConnectedChart';

import '@eeacms/volto-plotlycharts/less/plotly.less';

const View = (props) => {
  const { data = {} } = props;
  const { visualization = {} } = data;

  return (
    <div className="plotly-chart">
      <ConnectedChart
        data={{
          chartSources: data.chartSources,
          data_query: data.data_query,
          download_button: data.download_button,
          has_data_query_by_context: data.has_data_query_by_context,
          has_data_query_by_provider: data.has_data_query_by_provider,
          provider_url: visualization.provider_url,
          use_live_data: data.use_live_data,
          with_sources: data.with_sources,
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
