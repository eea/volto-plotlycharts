import React from 'react';
import { Message } from 'semantic-ui-react';
import { SidebarPortal, BlockDataForm } from '@plone/volto/components';
import PlotlyComponent from '@eeacms/volto-plotlycharts/PlotlyComponent';
import schema from './schema';

const Edit = (props) => {
  const { data, block, onChangeBlock } = props;

  return (
    <>
      {!data.vis_url && (
        <Message>Please select a visualization from block editor.</Message>
      )}
      {!!data.vis_url && (
        <div className="embed-visualization edit">
          <PlotlyComponent
            {...props}
            mode="edit"
            data={{
              ...data,
              download_button: data.download_button ?? true,
              has_data_query_by_context: data.has_data_query_by_context ?? true,
              with_sources: true,
              with_more_info: data.with_more_info ?? true,
              with_notes: data.with_notes ?? true,
            }}
          />
        </div>
      )}
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
    </>
  );
};

export default Edit;
