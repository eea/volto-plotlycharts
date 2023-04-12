import React from 'react';
import ConnectedChart2 from '@eeacms/volto-plotlycharts/ConnectedChart2';

import '@eeacms/volto-plotlycharts/less/visualization.less';

const View = (props) => {
  const { data = {} } = props;

  return (
    <div className="embed-visualization">
      <ConnectedChart2
        id={props.id}
        data={{
          chartSources: data.chartSources,
          data_query: data.data_query,
          download_button: data.download_button,
          has_data_query_by_context: data.has_data_query_by_context,
          has_data_query_by_provider: data.has_data_query_by_provider,
          use_live_data: true,
          vis_url: data.vis_url,
          with_sources: data.show_sources,
        }}
        hoverFormatXY={data.hover_format_xy}
        withSources={data.show_sources}
        width={data.width}
        height={data.height}
      />
    </div>
  );
};

export default View;
