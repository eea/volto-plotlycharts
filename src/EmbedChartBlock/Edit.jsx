/*
 * Pick up a chart from an existing visualization, add text
 */

import { v4 as uuid } from 'uuid';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Form as UiForm } from 'semantic-ui-react';

// TODO: use volto-slate
import Editor from '@plone/volto/components/manage/Blocks/Text/Edit';
import { SidebarPortal } from '@plone/volto/components'; // EditBlock

import { changeSidebarState } from 'volto-plotlycharts/actions';
// import { BlockEditForm } from 'volto-addons/BlockForm';
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';
import ConnectedChart from 'volto-plotlycharts/ConnectedChart';

import schema from './schema';

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

  handleClickOutside = (e) => {
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
    const { block } = this.props; // , data, onChangeBlock, selected, title
    return (
      <div className="block selected">
        <div className="block-inner-wrapper">
          <SidebarPortal selected={this.props.selected}>
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
              <Segment secondary={this.state.activeEditorSegment === 0}>
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
