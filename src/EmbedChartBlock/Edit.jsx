/*
 * Pick up a chart from an existing visualization, add text
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Grid, Form as UiForm } from 'semantic-ui-react';

import { Field } from '@plone/volto/components'; // EditBlock
import { SidebarPortal } from '@plone/volto/components';

import { changeSidebarState } from 'volto-sidebar/actions';

import PickVisualization from '../PickVisualization';
import ConnectedChart from '../ConnectedChart';

class ChartPick extends Component {
  componentDidMount() {
    this.props.changeSidebarState(true);
  }

  render() {
    return (
      <div className="block selected">
        {this.props.selected && (
          <SidebarPortal selected={true}>
            <Segment.Group raised>
              <header className="header pulled">
                <h2>Edit chart options</h2>
              </header>
              <Segment className="form sidebar-image-data">
                <PickVisualization
                  onLoadChartData={chartData =>
                    this.props.onChangeBlock(this.props.block, {
                      ...this.props.data,
                      chartData,
                    })
                  }
                  currentChartData={this.props.data?.chartData}
                  onChange={url =>
                    this.props.onChangeBlock(this.props.block, {
                      ...this.props.data,
                      vis_url: url,
                    })
                  }
                  value={this.props.data?.vis_url || ''}
                />
                <Field
                  title="Source"
                  id="chart-source"
                  type="text"
                  value={this.props.data.chart_source || ''}
                  required={false}
                  onChange={(e, d) =>
                    this.props.onChangeBlock(this.props.block, {
                      ...this.props.data,
                      chart_source: d,
                    })
                  }
                />
                <Field
                  title="Source Link"
                  id="chart-source-link"
                  type="text"
                  value={this.props.data.chart_source_link || ''}
                  required={false}
                  onChange={(e, d) =>
                    this.props.onChangeBlock(this.props.block, {
                      ...this.props.data,
                      chart_source_link: d,
                    })
                  }
                />
              </Segment>
            </Segment.Group>
          </SidebarPortal>
        )}

        <div className="block-inner-wrapper">
          <Grid columns={2} divided>
            <Grid.Row>
              <Grid.Column>
                <UiForm>
                  <Field
                    title="Text"
                    id="chart-text"
                    widget="cktext"
                    value={this.props.data.text}
                    required={false}
                    onChange={(e, d) =>
                      this.props.onChangeBlock(this.props.block, {
                        ...this.props.data,
                        text: d,
                      })
                    }
                  />
                </UiForm>
              </Grid.Column>
              <Grid.Column>
                {this.props.data?.chartData && (
                  <ConnectedChart
                    data={{ chartData: this.props.data.chartData }}
                    className="embedded-block-chart"
                    config={{ displayModeBar: false }}
                  />
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  { changeSidebarState },
)(ChartPick);
