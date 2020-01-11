import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import ConnectedChart from '../ConnectedChart';

class EmbedChartView extends Component {
  constructor(props) {
    super(props);

    // console.log('chart data', this.props.data, this.props);
    // TODO: there's no need for state and these checks, get rid of them
    let chartData = this.props.data.chartData || [];

    if (typeof chartData === 'string') {
      try {
        chartData = JSON.parse(chartData);
      } catch (error) {
        console.log('Error in JSON parsing chart data', error);
        chartData = {};
      }
    }

    // TODO: the axis labels need to come from the data

    this.state = {
      chartData,
    };
  }

  render() {
    let text = this.props.data['chart-text'];
    if (typeof text !== 'string') text = '';
    return (
      <div className="chartWrapperView">
        <div className="block-inner-wrapper">
          <Grid>
            <Grid.Column width={4}>
              <div className="block-text-content">
                {text && <div dangerouslySetInnerHTML={{ __html: text }} />}
              </div>
            </Grid.Column>
            <Grid.Column width={8}>
              {this.state.chartData ? (
                <ConnectedChart
                  data={this.state.chartData}
                  className="embedded-block-chart"
                />
              ) : (
                <div>No valid data.</div>
              )}
            </Grid.Column>
            <Grid.Column width={12}>
              <div>
                <a
                  className="discreet"
                  href={this.props.data.chart_source_link}
                >
                  {this.props.data.chart_source}
                </a>
              </div>
            </Grid.Column>
          </Grid>
        </div>
      </div>
    );
  }
}

EmbedChartView.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default EmbedChartView;
