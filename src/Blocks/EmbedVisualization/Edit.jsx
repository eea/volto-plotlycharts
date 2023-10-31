import React from 'react';
import { SidebarPortal, BlockDataForm } from '@plone/volto/components';
import ConnectedChart from '@eeacms/volto-plotlycharts/ConnectedChart';
import schema from './schema';

import '@eeacms/volto-plotlycharts/less/visualization.less';

const Edit = (props) => {
  const { data, block, onChangeBlock } = props;

  return (
    <div className="embed-visualization edit">
      <ConnectedChart
        id={props.id}
        data={{
          ...data,
          download_button: data.download_button ?? true,
          has_data_query_by_context: data.has_data_query_by_context ?? true,
          with_sources: data.with_sources ?? true,
          use_live_data: true,
          with_more_info: data.with_more_info ?? true,
          with_notes: data.with_notes ?? true,
        }}
      />

      <SidebarPortal selected={props.selected}>
        <BlockDataForm
          block={block}
          title={schema.title}
          schema={schema}
          onChangeBlock={onChangeBlock}
          onChangeField={(id, value) => {
            onChangeBlock(block, {
              ...data,
              [id]: value,
            });
          }}
          formData={data}
        />
      </SidebarPortal>
    </div>
  );
};

export default Edit;
