import React from 'react';
import PropTypes from 'prop-types';
import ConnectedChart from '../ConnectedChart';
import ViewText from '@plone/volto/components/manage/Blocks/Text/View';
import { SourcesBlockView } from '@eeacms/volto-datablocks/components';
import { connect } from 'react-redux';

import { serializeNodes } from 'volto-slate/editor/render';

import WidthBasedLayoutProvider from '../LayoutProvider/WidthBasedLayoutProvider';

const EmbedChartView = ({
  data,
  layout_type,
  providerUrl,
  min_width,
  ...props
}) => {
  if (!data) return '';

  const isNewEditor = data.text?.editor === 'slate';

  const isDefaultText =
    data.text?.blocks?.length === 1 &&
    data.text?.blocks?.[0]?.children?.[0].text === '';

  const hasText =
    data.text?.blocks?.length > 0 && data.text?.blocks && !isDefaultText;

  const hasOldText =
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
  return (
    <div className="chartWrapperView">
      {data.block_title ? <h5>{data.block_title}</h5> : ''}
      <div className="block-inner-wrapper">
        <div className="element-grid mobile-col">
          {hasText && isNewEditor ? (
            <div
              className={`${layout_type}-${grid.text_column[layout_type]} text-segment mobile-full`}
            >
              <div
                className="block-text-content mobile-full"
                style={{ padding: '1rem', marginTop: '.5rem' }}
              >
                {serializeNodes(data.text.blocks || [])}
              </div>
            </div>
          ) : (
            ''
          )}
          {hasOldText && !isNewEditor && <ViewText data={data} {...props} />}
          <div className={`${layout_type}-${grid.chart_column[layout_type]}`}>
            {data.chartData ? (
              <div
                style={{
                  overflow: data.min_width ? 'auto' : 'unset',
                }}
              >
                <ConnectedChart
                  source={data.vis_url}
                  data={{ chartData: data.chartData }}
                  className="embedded-block-chart"
                  hoverFormatXY={data.hover_format_xy}
                  min_width={data.min_width}
                />
              </div>
            ) : (
              <div>No valid data.</div>
            )}
          </div>
          <div>
            <SourcesBlockView
              initialSource={data.chart_source}
              initialSourceLink={data.chart_source_link}
              multipleSources={data.chartSources}
              providerUrl={providerUrl || data.chartData?.provider_url}
              download_button={data.download_button}
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

export default connect((state, props) => {
  const visUrl = props.data?.vis_url;
  const providerUrl = visUrl
    ? state.chart_data_visualization?.[visUrl]?.item?.provider_url
    : null;
  return {
    providerUrl,
  };
}, {})(WidthBasedLayoutProvider(EmbedChartView));
