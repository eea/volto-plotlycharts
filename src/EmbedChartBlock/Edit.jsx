/*
 * Pick up a chart from an existing visualization, add text
 */

import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Form as UiForm } from 'semantic-ui-react';

import { Field } from '@plone/volto/components'; // EditBlock
import { SidebarPortal } from '@plone/volto/components';

import { changeSidebarState } from 'volto-sidebar/actions';
import Editor from '@plone/volto/components/manage/Blocks/Text/Edit';
import MultiValuesEdit from 'volto-datablocks/DataConnectedBlock/MultiValuesEdit';

import PickVisualization from '../PickVisualization';
import ConnectedChart from '../ConnectedChart';
import { v4 as uuid } from 'uuid';
import { Button } from 'semantic-ui-react';
import { TextWidget } from '@plone/volto/components';

const toolbarId = uuid();

class EmbedChartBlockEdit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textEditorIsActive: false,
    };
  }
  componentDidMount() {
    this.props.changeSidebarState(true);

    __CLIENT__ &&
      document &&
      document.addEventListener('mousedown', this.handleClickOutside, false);
  }

  componentWillUnmount() {
    __CLIENT__ &&
      document &&
      document.removeEventListener('mousedown', this.handleClickOutside, false);
  }

  handleClickOutside = e => {
    let toolbar = __CLIENT__ && document && document.getElementById(toolbarId);

    let active =
      (this.textEditorSegmentNode.current &&
        doesNodeContainClick(this.textEditorSegmentNode.current, e)) ||
      (this.textEditorSegmentNode.current &&
        toolbar &&
        doesNodeContainClick(toolbar, e))
        ? true
        : false;

    this.setState(() => ({
      textEditorIsActive: active,
    }));
  };

  nop = () => {};

  textEditorSegmentNode = React.createRef();

  render() {
    return (
      <div className="block selected">
        <SidebarPortal selected={this.props.selected}>
          <Segment.Group raised>
            <header className="header pulled">
              <h2>{this.props.title || 'Edit chart options'}</h2>
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
                title="Hover format"
                id="hover-format"
                type="text"
                value={this.props.data.hover_format_xy || ''}
                description={
                  <div>
                    See{' '}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://github.com/d3/d3-3.x-api-reference/blob/master/Formatting.md#d3_format"
                    >
                      d3 format documentation
                    </a>
                  </div>
                }
                required={false}
                onChange={(e, d) =>
                  this.props.onChangeBlock(this.props.block, {
                    ...this.props.data,
                    hover_format_xy: d,
                  })
                }
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
              {this.props.data.chartSources &&
              this.props.data.chartSources.length
                ? this.props.data.chartSources.map((item, index) => (
                    <React.Fragment>
                      <TextWidget
                        title="Source"
                        id={`chart-source_${index}`}
                        type="text"
                        value={item.chart_source}
                        required={false}
                        onChange={(e, d) => {
                          const dataClone = JSON.parse(
                            JSON.stringify(this.props.data.chartSources),
                          );
                          dataClone[index].chart_source = d;
                          this.props.onChangeBlock(this.props.block, {
                            ...this.props.data,
                            chartSources: dataClone,
                          });
                        }}
                      />
                      <TextWidget
                        title="Source Link"
                        id={`chart-source_link_${index}`}
                        type="text"
                        value={item.chart_source_link}
                        required={false}
                        onChange={(e, d) => {
                          const dataClone = JSON.parse(
                            JSON.stringify(this.props.data.chartSources),
                          );
                          dataClone[index].chart_source_link = d;
                          this.props.onChangeBlock(this.props.block, {
                            ...this.props.data,
                            chartSources: dataClone,
                          });
                        }}
                      />
                    </React.Fragment>
                  ))
                : ''}
              <Button
                primary
                onClick={() => {
                  const chartSources =
                    this.props.data.chartSources &&
                    this.props.data.chartSources.length
                      ? JSON.parse(JSON.stringify(this.props.data.chartSources))
                      : [];
                  chartSources.push({
                    chart_source_link: '',
                    chart_source: '',
                  });
                  this.props.onChangeBlock(this.props.block, {
                    ...this.props.data,
                    chartSources: chartSources,
                  });
                }}
              >
                Add source
              </Button>
              <MultiValuesEdit
                schema={this.props.schema || {}}
                onChange={data =>
                  this.props.onChangeBlock(this.props.block, data)
                }
                data={this.props.data}
              />
            </Segment>
          </Segment.Group>
        </SidebarPortal>

        <div className="block-inner-wrapper">
          <UiForm>
            <Segment.Group horizontal>
              <Segment style={{ maxWidth: '40%' }}>
                <div
                  style={{ minWidth: '73px' }}
                  ref={this.textEditorSegmentNode}
                >
                  <Editor
                    index={this.props.index}
                    detached={true}
                    selected={this.state.textEditorIsActive}
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
                    blockNode={this.textEditorSegmentNode}
                    toolbarId={toolbarId}
                  />
                </div>
              </Segment>
              <Segment secondary={this.state.activeEditorSegment === 0}>
                {this.props.data?.chartData && (
                  <ConnectedChart
                    data={{ chartData: this.props.data.chartData }}
                    className="embedded-block-chart"
                    config={{ displayModeBar: false }}
                  />
                )}
              </Segment>
            </Segment.Group>
          </UiForm>
        </div>
      </div>
    );
  }
}

export default connect(
  null,
  { changeSidebarState },
)(EmbedChartBlockEdit);
