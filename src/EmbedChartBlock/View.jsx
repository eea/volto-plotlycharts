import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import ConnectedChart from '../ConnectedChart';
import ViewText from '@plone/volto/components/manage/Blocks/Text/View';
import SourceView from 'volto-datablocks/theme/Blocks/SourceView';
import { connect } from 'react-redux';

import WidthBasedLayoutProvider from '~/components/theme/LayoutProvider/WidthBasedLayoutProvider';

const EmbedChartView = props => {
  const hasText =
    (props.data.text?.blocks?.length > 1 && props.data.text?.blocks) ||
    (props.data.text?.blocks?.length === 1 &&
      props.data.text?.blocks?.[0].text);

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
      {props.data.block_title ? <h5>{props.data.block_title}</h5> : ''}
      <div className="block-inner-wrapper">
        <div className="element-grid">
          {hasText ? (
            <div
              className={`${props.layout_type}-${
                grid.text_column[props.layout_type]
              }`}
            >
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
          <div
            className={`${props.layout_type}-${
              grid.chart_column[props.layout_type]
            }`}
          >
            {props.data.chartData ? (
              <ConnectedChart
                source={props.data.vis_url}
                data={props.data.chartData}
                className="embedded-block-chart"
                hoverFormatXY={props.data.hover_format_xy}
              />
            ) : (
              <div>No valid data.</div>
            )}
          </div>
          <div>
            <SourceView
              initialSource={props.data.chart_source}
              initialSourceLink={props.data.chart_source_link}
              multipleSources={props.data.chartSources}
              providerUrl={props.providerUrl}
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
