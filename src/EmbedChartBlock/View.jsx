import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import ConnectedChart from '../ConnectedChart';
import ViewText from '@plone/volto/components/manage/Blocks/Text/View';

const EmbedChartView = props => {
  return (
    <div className="chartWrapperView">
      {props.data.block_title ? <h5>{props.data.block_title}</h5> : ''}
      <div className="block-inner-wrapper">
        <Grid>
          <Grid.Row>
            <Grid.Column width={4}>
              <div
                className="block-text-content"
                style={{ padding: '1rem', marginTop: '.5rem' }}
              >
                <ViewText {...props} />
              </div>
            </Grid.Column>
            <Grid.Column width={8}>
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
                <a className="discreet" href={props.data.chart_source_link}>
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
