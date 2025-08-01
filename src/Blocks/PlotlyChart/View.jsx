import React from 'react';
import PlotlyComponent from '@eeacms/volto-plotlycharts/PlotlyComponent';

const View = (props) => {
  const { data = {} } = props;

  return (
    <div className="plotly-chart">
      <PlotlyComponent
        data={{
          ...data,
          download_button: true,
          has_data_query_by_context: data.has_data_query_by_context ?? true,
          with_sources: data.with_sources ?? true,
        }}
      />
    </div>
  );
};

export default View;
