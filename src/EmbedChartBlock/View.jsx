import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import ConnectedChart from '../ConnectedChart';
import ViewText from '@plone/volto/components/manage/Blocks/Text/View';

const EmbedChartView = props => {
  const hasText =
    (props.data.text?.blocks?.length > 1 && props.data.text?.blocks) ||
    (props.data.text?.blocks?.length === 1 &&
      props.data.text?.blocks?.[0].text);
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
            <Grid.Column width={12}>
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
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    </div>
  );
};

EmbedChartView.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default EmbedChartView;
