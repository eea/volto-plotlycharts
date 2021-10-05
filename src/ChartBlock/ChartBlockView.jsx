import ConnectedChart from '../ConnectedChart';
import { SourcesBlockView } from '@eeacms/volto-datablocks/components';
import cx from 'classnames';
import useMarginCalculator from '../MarginCalculator';
import React from 'react';

const parseRawJSON = (data) => {
  var parsed = '';
  try {
    parsed = JSON.parse(data);
  } catch (e) {
    console.log(e.message);
  }
  return parsed;
};

const ChartView = ({ data, ...props }) => {
  const margins = useMarginCalculator();

  const hasCustomData = data.custom_chart_toggle
    ? data.custom_chart_toggle
    : false;

  const customData =
    hasCustomData && data.custom_chart_data
      ? parseRawJSON(data.custom_chart_data)
      : '';

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
        data.align === 'full'
          ? { marginLeft: `-${margins}px`, marginRight: `-${margins}px` }
          : {}
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
              data={
                hasCustomData && customData
                  ? {
                      ...data,
                      chartData: {
                        ...data.chartData,
                        data: customData,
                      },
                    }
                  : data
              }
              className="chart-block-chart"
              hoverFormatXY={data.hover_format_xy}
            />
            <div>
              <SourcesBlockView
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
