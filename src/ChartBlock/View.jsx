import React from 'react';
import ConnectedChart from '../ConnectedChart';

const ChartView = props => {
  return (
    <div className="chartWrapperView">
      <div className="block-inner-wrapper">
        <ConnectedChart {...props} className="chart-block-chart" />
        <div>
          <a
            className="discreet block_source"
            href={props.data.chart_source_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            {props.data.chart_source}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ChartView;
