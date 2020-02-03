import React from 'react';
import ConnectedChart from '../ConnectedChart';
import { SourceView } from 'volto-datablocks/Sources';
import cx from 'classnames';

const ChartView = ({ data, ...props }) => {
  return (
    <div
      className={cx(
        'block maps align',
        {
          center: !Boolean(data.align),
        },
        data.align,
      )}
      style={
        data.align === 'full' ? { position: 'static', height: '45vh' } : {}
      }
    >
      <div
        className={cx({
          'full-width-block': data.align === 'full',
        })}
      >
        <div className="chartWrapperView">
          <div
            className="block-inner-wrapper"
            style={{
              overflow: data.min_width ? 'auto' : 'unset',
            }}
          >
            <ConnectedChart
              {...props}
              data={data}
              className="chart-block-chart"
              hoverFormatXY={data.hover_format_xy}
            />
            <div>
              <SourceView
                initialSource={data.chart_source}
                initialSourceLink={data.chart_source_link}
                multipleSources={data.chartSources}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartView;
