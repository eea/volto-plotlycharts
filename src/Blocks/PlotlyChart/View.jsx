import React from 'react';
import ConnectedChart from '@eeacms/volto-plotlycharts/ConnectedChart';

import '@eeacms/volto-plotlycharts/less/plotly.less';

const View = (props) => {
  const { data = {} } = props;

  return (
    <div className="plotly-chart">
      <ConnectedChart
        data={{
          ...data,
          download_button: data.download_button ?? true,
          has_data_query_by_context: data.has_data_query_by_context ?? true,
          with_sources: data.with_sources ?? true,
          use_live_data: data.visualization?.use_live_data ?? true,
        }}
      />
    </div>
  );
};

export default View;
