import React from 'react';
import PlotlyComponent from '@eeacms/volto-plotlycharts/PlotlyComponent';

const View = (props) => {
  const { data = {} } = props;

  return (
    <div className="embed-visualization view">
      <PlotlyComponent
        {...props}
        mode={props.mode || 'view'}
        data={{
          ...data,
          download_button: true,
          has_data_query_by_context: data.has_data_query_by_context ?? true,
          with_sources: true,
          llm_summary: data.properties?.llm_summary,
        }}
      />
    </div>
  );
};

export default View;
