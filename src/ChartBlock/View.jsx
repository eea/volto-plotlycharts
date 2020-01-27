import React from 'react';
import ConnectedChart from '../ConnectedChart';
import SourceView from 'volto-datablocks/theme/Blocks/SourceView';
const ChartView = props => {
  return (
    <div className="chartWrapperView">
      <div className="block-inner-wrapper">
        <ConnectedChart {...props} className="chart-block-chart" />
        <div>
          <SourceView
            initialSource={props.data.chart_source}
            initialSourceLink={props.data.chart_source_link}
            multipleSources={props.data.chartSources}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartView;
