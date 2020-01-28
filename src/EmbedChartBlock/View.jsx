import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import ConnectedChart from '../ConnectedChart';
import ViewText from '@plone/volto/components/manage/Blocks/Text/View';
import SourceView from 'volto-datablocks/theme/Blocks/SourceView';
import { connect } from 'react-redux';

const EmbedChartView = props => {
  const hasText =
    (props.data.text?.blocks?.length > 1 && props.data.text?.blocks) ||
    (props.data.text?.blocks?.length === 1 &&
      props.data.text?.blocks?.[0].text);
  console.log('embed chart props', props);
  return (
    <div className="chartWrapperView">
      {props.data.block_title ? <h5>{props.data.block_title}</h5> : ''}
      <div className="block-inner-wrapper">
        <Grid>
          <Grid.Row>
            {hasText ? (
              <Grid.Column computer={4} largeScreen={4} tablet={12} mobile={12}>
                <div
                  className="block-text-content"
                  style={{ padding: '1rem', marginTop: '.5rem' }}
                >
                  <ViewText {...props} />
                </div>
              </Grid.Column>
            ) : (
              ''
            )}
            <Grid.Column
              computer={hasText ? 8 : 12}
              largeScreen={hasText ? 8 : 12}
              tablet={12}
              mobile={12}
            >
              {props.data.chartData ? (
                <ConnectedChart
                  source={props.data.vis_url}
                  data={props.data.chartData}
                  className="embedded-block-chart"
                />
              ) : (
                <div>No valid data.</div>
              )}
            </Grid.Column>
            <div>
              <SourceView
                initialSource={props.data.chart_source}
                initialSourceLink={props.data.chart_source_link}
                multipleSources={props.data.chartSources}
                providerUrl={props.providerUrl}
              />
            </div>
          </Grid.Row>
        </Grid>
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
)(EmbedChartView);
