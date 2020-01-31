/*
 * Pick up a chart from an existing visualization, add text
 */

import { v4 as uuid } from 'uuid';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Segment, Form as UiForm } from 'semantic-ui-react';

import { changeSidebarState } from 'volto-sidebar/actions';
import Editor from '@plone/volto/components/manage/Blocks/Text/Edit';

import ConnectedChart from '../ConnectedChart';
import ChartEmbedSidebar from './ChartEmbedSidebar';

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
        <ChartEmbedSidebar {...this.props} />

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
