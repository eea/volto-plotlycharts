import React from 'react';
import ConnectedChart from '../ConnectedChart';

const ChartView = props => {
  return (
    <div className="chartWrapperView">
      <div className="block-inner-wrapper">
        <ConnectedChart {...props} className="chart-block-chart" />
        <div>
          <a className="discreet" href={props.data.chart_source_link}>
            {props.data.chart_source}
          </a>
        </div>
      </div>
    </div>
  );
};

export default ChartView;
