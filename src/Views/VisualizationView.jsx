import React from 'react';
import ConnectedChart from '../ConnectedChart';

const VisualizationView = (props) => {
  const { content = {} } = props;

  return (
    <div>
      <ConnectedChart visualization={content.visualization} />
    </div>
  );
};

export default VisualizationView;
