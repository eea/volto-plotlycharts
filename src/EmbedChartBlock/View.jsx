import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import ConnectedChart from '../ConnectedChart';
import ViewText from '@plone/volto/components/manage/Blocks/Text/View';

const EmbedChartView = props => {
  return (
    <div className="chartWrapperView">
      <div className="block-inner-wrapper">
        <Grid>
          <Grid.Column width={4}>
            <div className="block-text-content">
              <ViewText {...props} />
            </div>
          </Grid.Column>
          <Grid.Column width={8}>
            {props.data.chartData ? (
              <ConnectedChart
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
        </Grid>
      </div>
    </div>
  );
};

EmbedChartView.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default EmbedChartView;
