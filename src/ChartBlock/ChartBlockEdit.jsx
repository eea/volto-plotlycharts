import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SidebarPortal } from '@plone/volto/components'; // EditBlock

import { changeSidebarState } from 'volto-plotlycharts/actions';
import { BlockEditForm } from 'volto-addons/BlockForm';
import ChartEditor from 'volto-plotlycharts/Widget/ChartEditor';

import schema from './schema';

class Edit extends Component {
  componentDidMount() {
    this.props.changeSidebarState(true);
  }

  componentDidUpdate(prevProps) {
    this.props.changeSidebarState(true);
  }

  onChangeEditorValue = value => {
    console.log('chartdata', this.props.data);

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

    // console.log('chartBlockEdit.jsx', this.props);

    return (
      <div className="block selected">
        <div className="block-inner-wrapper" />
        <ChartEditor
          value={chartData}
          provider_url={this.props.data?.url}
          onChangeValue={value => {
            console.log('ime also here', value);
            this.onChangeEditorValue(value);
          }}
        />
        <SidebarPortal selected={this.props.selected}>
          <BlockEditForm
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

export default connect(
  null,
  { changeSidebarState },
)(Edit);

// // I think this should always be true
// if (this.props.url && this.props.url !== prevProps.url) {
//   this.props.changeSidebarState(true);
//   // this.props.getDataFromProvider(this.props.url);
// }
