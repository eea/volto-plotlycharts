/*
 * Pick up a chart from an existing visualization, add text
 */

import { v4 as uuid } from 'uuid';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Form as UiForm } from 'semantic-ui-react';

// TODO: use volto-slate
import Editor from '@plone/volto/components/manage/Blocks/Text/Edit';
import { SidebarPortal } from '@plone/volto/components'; // EditBlock

import InlineForm from '@plone/volto/components/manage/Form/InlineForm';
import { changeSidebarState } from '../actions';
import ConnectedChart from '../ConnectedChart';

import schema from './schema';

const toolbarId = uuid();

class EmbedChartBlockEdit extends Component {
  nop = () => {};

  render() {
    const { block, selected } = this.props;

    return (
      <div className="block">
        <div className="block-inner-wrapper">
          <SidebarPortal selected={selected}>
            <InlineForm
              schema={schema}
              title={schema.title}
              onChangeField={(id, value) => {
                this.props.onChangeBlock(block, {
                  ...this.props.data,
                  [id]: value,
                });
              }}
              formData={this.props.data}
            />
          </SidebarPortal>

          <UiForm>
            <Segment.Group horizontal>
              <Segment style={{ maxWidth: '40%' }}>
                <div style={{ minWidth: '73px' }}>
                  <Editor
                    index={this.props.index}
                    detached={true}
                    selected={selected}
                    block={this.props.block}
                    onAddBlock={this.nop}
                    onChangeBlock={(id, { text }) => {
                      this.props.onChangeBlock(block, {
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
              <Segment secondary={!selected}>
                {this.props.data?.chartData && (
                  <ConnectedChart
                    className="embedded-block-chart"
                    data={{ chartData: this.props.data.chartData }}
                    hoverFormatXY={this.props.data?.hover_format_xy}
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

export default connect(null, { changeSidebarState })(EmbedChartBlockEdit);
