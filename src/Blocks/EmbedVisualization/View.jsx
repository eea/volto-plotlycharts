import React from 'react';
import ConnectedChart from '@eeacms/volto-plotlycharts/ConnectedChart';

import '@eeacms/volto-plotlycharts/less/visualization.less';

const View = (props) => {
  const { data = {} } = props;

  return (
    <ConnectedChart
      id={props.id}
      data={{
        ...data,
        download_button: data.download_button ?? true,
        has_data_query_by_context: data.has_data_query_by_context ?? true,
        with_sources: true,
      }}
    />
  );
};

export default View;
