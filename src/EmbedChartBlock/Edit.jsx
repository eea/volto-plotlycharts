/*
 * Pick up a chart from an existing visualization, add text
 */

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Grid, Form as UiForm } from 'semantic-ui-react';

import { Field } from '@plone/volto/components'; // EditBlock
import { SidebarPortal } from '@plone/volto/components';

import { changeSidebarState } from 'volto-sidebar/actions';
import Editor from '@plone/volto/components/manage/Blocks/Text/Edit';

import PickVisualization from '../PickVisualization';
import ConnectedChart from '../ConnectedChart';

class EmbedChartBlockEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textEditorSelected: false,
    };
  }
  componentDidMount() {
    this.props.changeSidebarState(true);
  }

  render() {
    console.log(this.props);
    return (
      <div className="block selected">
        <SidebarPortal selected={this.props.selected}>
          <Segment.Group raised>
            <header className="header pulled">
              <h2>Edit chart options</h2>
            </header>
            <Segment className="form sidebar-image-data">
              <PickVisualization
                id={`vis-${this.props.block}`}
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

        <div className="block-inner-wrapper">
          <Grid columns={2} divided>
            <Grid.Row>
              <Grid.Column>
                <UiForm>
                  <Editor
                    index={this.props.index}
                    detached={true}
                    selected={this.state.textEditorSelected}
                    block={this.props.block}
                    onAddBlock={this.nop}
                    onChangeBlock={(id, { text }) => {
                      this.props.onChangeBlock(this.props.block, {
                        ...this.props.data,
                        text,
                      });
                    }}
                    onDeleteBlock={this.nop}
                    onFocusPreviousBlock={this.nop}
                    onFocusNextBlock={this.nop}
                    onSelectBlock={this.nop}
                    onMutateBlock={this.nop}
                    data={this.props.data}
                    blockNode={this.props.blockNode}
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
)(EmbedChartBlockEdit);
