import React, { Component } from 'react';

import { SidebarPortal } from '@plone/volto/components'; // EditBlock

import InlineForm from '@plone/volto/components/manage/Form/InlineForm';
import ChartEditorWidget from './Widget';
import { withEditBlockData } from 'volto-datablocks/hocs';
import { isEqual } from 'lodash';

import schema from './schema';

class Edit extends Component {
  chartNode = React.createRef();

  componentDidUpdate(prevProps) {
    // console.log('updated', prevProps, this.props);
    // when we read the content from the block, we want to also write it in the
    // form
    if (
      !isEqual(
        prevProps.data?.chartData?.data,
        this.props.data?.chartData?.data,
      )
    ) {
      // const newvalue = {
      //   ...this.props.data,
      //   chartData: {
      //     ...this.props.data.chartData
      //   }
      // };
      // console.log('propagate', this.props.data);
      this.props.onChangeBlock(this.props.block, this.props.data);
    }
  }

  render() {
    const chartData = this.props.data.chartData || {
      layout: {},
      frames: [],
      data: [],
    };

    return (
      <>
        {/* {this.props.block} */}
        <div className="connected-chart" ref={this.chartNode}>
          <ChartEditorWidget
            title="Plotly Chart"
            required={true}
            value={{
              ...chartData,
              provider_url: this.props.data?.url,
            }}
            id={`field-plotlychart-${this.props.block}`}
            onChange={(id, value) => {
              const newvalue = {
                ...this.props.data,
                url: value.provider_url,
                chartData: JSON.parse(JSON.stringify(value)),
              };
              // console.log('onchange', newvalue);
              this.props.onChangeBlock(this.props.block, newvalue);
            }}
          />
          {/* {JSON.stringify(this.props.data, null, 2)} */}
        </div>

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
      </>
    );
  }
}

// export default Edit;
export default withEditBlockData(Edit);
