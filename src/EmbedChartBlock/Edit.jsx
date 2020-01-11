import { getChartDataFromVisualization } from '../actions';
import { searchContent } from '@plone/volto/actions';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { Grid, Form as UiForm } from 'semantic-ui-react';
import { Field } from '@plone/volto/components'; // EditBlock
import ConnectedChart from '../ConnectedChart';

/*
 * Pick up a chart from an existing visualization, add text
 */
class ChartPick extends Component {
  constructor(props) {
    super(props);

    const localChartData = props.data.chartData || {};

    let text = props.data['chart-text'];
    if (typeof text !== 'string') text = '';

    this.state = {
      localChartData,
      text,
      ...props.data,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.updateData = this.updateData.bind(this);
    // this.getChartData = this.getChartData.bind(this);
    this.handleChangeVisualization = this.handleChangeVisualization.bind(this);
  }

  updateData(obj) {
    this.setState(obj, this.onSubmit);
  }

  onSubmit() {
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      'chart-text': this.state.text,
      chartData: this.state.localChartData,
      ...this.state,
    });
  }

  handleChangeVisualization(id, path) {
    // TODO: use getContent with subrequest, no need for specially dedicated
    // action and reducer. Complication not needed.
    this.props.getChartDataFromVisualization(path);
  }

  componentDidMount() {
    // get the existing visualizations
    this.props.searchContent('', {
      // object_provides: 'forests.content.interfaces.IDataVisualization',
      portal_type: 'Visualization',
    });
  }

  componentDidUpdate(prevProps) {
    // console.log('new props', this.props);
    if (this.props.remoteChartData !== prevProps.remoteChartData) {
      this.setState({
        localChartData: this.props.remoteChartData,
      });
    }
  }

  render() {
    // console.log('state in render', this.state);
    return (
      <div className="block selected">
        <div className="block-inner-wrapper">
          <Grid columns={2} divided>
            <Grid.Row>
              <Grid.Column>
                {this.state.localChartData && (
                  <ConnectedChart
                    data={{ chartData: this.state.localChartData }}
                    className="embedded-block-chart"
                    config={{ displayModeBar: false }}
                  />
                )}
              </Grid.Column>
              <Grid.Column>
                <UiForm>
                  <Field
                    title="Pick chart from existing visualization"
                    id="chart-data"
                    choices={this.props.visualizations}
                    required={true}
                    onChange={this.handleChangeVisualization}
                  />
                  <Field
                    title="Text"
                    id="chart-text"
                    widget="cktext"
                    value={this.state.text}
                    required={false}
                    onChange={(e, d) => this.updateData({ text: d })}
                  />
                  <Field
                    title="Source"
                    id="chart-source"
                    type="text"
                    value={this.state.chart_source}
                    required={false}
                    onChange={(e, d) => this.updateData({ chart_source: d })}
                  />
                  <Field
                    title="Source Link"
                    id="chart-source-link"
                    type="text"
                    value={this.state.chart_source_link}
                    required={false}
                    onChange={(e, d) =>
                      this.updateData({ chart_source_link: d })
                    }
                  />
                </UiForm>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </div>
    );
  }
}

export default connect(
  (state, props) => {
    // const chartData = state.data_providers ? state.data_providers.item : {};
    // console.log('connect props', state, props);
    let visualizations = state.search ? state.search.items : [];
    visualizations = visualizations.map(el => [el['@id'], el.title]);
    return {
      visualizations,
      remoteChartData:
        state.chart_data_visualization && state.chart_data_visualization.data,
    };
  },
  { searchContent, getChartDataFromVisualization },
)(ChartPick);
