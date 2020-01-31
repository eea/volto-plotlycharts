import React from 'react';
import PropTypes from 'prop-types';
import ConnectedChart from '../ConnectedChart';
import ViewText from '@plone/volto/components/manage/Blocks/Text/View';
import { SourceView } from 'volto-datablocks/Sources';
import { connect } from 'react-redux';

import WidthBasedLayoutProvider from '~/components/theme/LayoutProvider/WidthBasedLayoutProvider';

const EmbedChartView = ({ data, layout_type, providerUrl, ...props }) => {
  const hasText =
    (data.text?.blocks?.length > 1 && data.text?.blocks) ||
    (data.text?.blocks?.length === 1 && data.text?.blocks?.[0].text);

  const grid = {
    text_column: {
      phone: 'twelve',
      tablet: 'twelve',
      desktop: 'four',
      widescreen: 'four',
    },
    chart_column: {
      phone: 'twelve',
      tablet: 'twelve',
      desktop: hasText ? 'eight' : 'twelve',
      widescreen: hasText ? 'eight' : 'twelve',
    },
  };

  // console.log('embed chart props', props);
  return (
    <div className="chartWrapperView">
      {data.block_title ? <h5>{data.block_title}</h5> : ''}
      <div className="block-inner-wrapper">
        <div className="element-grid">
          {hasText ? (
            <div className={`${layout_type}-${grid.text_column[layout_type]}`}>
              <div
                className="block-text-content"
                style={{ padding: '1rem', marginTop: '.5rem' }}
              >
                <ViewText {...props} />
              </div>
            </div>
          ) : (
            ''
          )}
          <div className={`${layout_type}-${grid.chart_column[layout_type]}`}>
            {data.chartData ? (
              <ConnectedChart
                source={data.vis_url}
                data={data.chartData}
                className="embedded-block-chart"
                hoverFormatXY={data.hover_format_xy}
              />
            ) : (
              <div>No valid data.</div>
            )}
          </div>
          <div>
            <SourceView
              initialSource={data.chart_source}
              initialSourceLink={data.chart_source_link}
              multipleSources={data.chartSources}
              providerUrl={providerUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

EmbedChartView.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default connect(
  (state, props) => {
    const visUrl = props.data?.vis_url;
    const providerUrl = visUrl
      ? state.chart_data_visualization?.[visUrl]?.item?.provider_url
      : null;
    return {
      providerUrl,
    };
  },
  {},
)(WidthBasedLayoutProvider(EmbedChartView));
