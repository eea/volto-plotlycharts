import React from 'react';
import ConnectedChart from '@eeacms/volto-plotlycharts/ConnectedChart';

import '@eeacms/volto-plotlycharts/less/visualization.less';

const View = (props) => {
  const { data = {} } = props;

  return (
    <div className="embed-visualization">
      <ConnectedChart
        data={{
          vis_url: data.vis_url,
          data_query: data.data_query,
          chartSources: data.chartSources,
          download_button: data.download_button,
        }}
        hoverFormatXY={data.hover_format_xy}
        withSources={true}
        width={data.width}
        height={data.height}
      />
    </div>
  );
};

export default View;
