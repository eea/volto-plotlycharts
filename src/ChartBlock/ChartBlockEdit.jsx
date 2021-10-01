import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SidebarPortal } from '@plone/volto/components'; // EditBlock

import InlineForm from '@plone/volto/components/manage/Form/InlineForm';
import { changeSidebarState } from '../actions';
import ChartEditor from '../Widget/ChartEditor';

import schema from './schema';

class Edit extends Component {
  componentDidMount() {
    this.props.changeSidebarState(true);
  }

  componentDidUpdate(prevProps) {
    this.props.changeSidebarState(true);
  }

  onChangeEditorValue = (value) => {
    const chartData = {
      data: value.data,
      layout: value.layout,
      frames: value.frames,
    };
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      ...chartData,
      chartData: {
        data: value.data,
        layout: value.layout,
        frames: value.frames,
      },
    });
  };

  render() {
    const chartData = this.props.data.chartData || {
      layout: {},
      frames: [],
      data: [],
    };

    return (
      <div className="block">
        <div className="block-inner-wrapper" />
        <ChartEditor
          value={chartData}
          provider_url={this.props.data?.url}
          onChangeValue={(value) => {
            this.onChangeEditorValue(value);
          }}
        />
        <SidebarPortal selected={this.props.selected}>
          <InlineForm
            schema={schema}
            title={schema.title}
            onChangeField={(id, value) => {
              this.props.onChangeBlock(this.props.block, {
                ...this.props.data,
                [id]: value,
              });
            }}
            formData={this.props.data}
          />
        </SidebarPortal>
      </div>
    );
  }
}

export default connect(null, { changeSidebarState })(Edit);
