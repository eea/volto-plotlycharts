import React, { Component } from 'react';
import { connect } from 'react-redux';

import { SidebarPortal } from '@plone/volto/components'; // EditBlock

import { changeSidebarState } from 'volto-sidebar/actions';
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

  render() {
    const chartData = this.props.data.chartData || {
      layout: {},
      frames: [],
      data: [],
    };

    console.log('chartBlockEdit.jsx', this.props);

    return (
      <div className="block selected">
        <div className="block-inner-wrapper">bla</div>
        <ChartEditor
          value={chartData}
          provider_url={this.props.data?.url}
          onChangeValue={value =>
            this.props.onChangeBlock(this.props.block, {
              ...this.props.data,
              chartData: value,
            })
          }
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
