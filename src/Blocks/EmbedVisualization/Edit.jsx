import React from 'react';
import { v4 as uuid } from 'uuid';
import { Segment, Form } from 'semantic-ui-react';
import { SidebarPortal } from '@plone/volto/components';
import Editor from '@plone/volto/components/manage/Blocks/Text/Edit';
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';
import ConnectedChart from '@eeacms/volto-plotlycharts/ConnectedChart';
import schema from './schema';

import '@eeacms/volto-plotlycharts/less/visualization.less';

const nope = () => {};

const toolbarId = uuid();

const Edit = (props) => {
  const { data, block, selected } = props;
  return (
    <>
      <Form>
        <Segment.Group horizontal>
          <Segment style={{ maxWidth: '40%' }}>
            <div style={{ minWidth: '73px' }}>
              <Editor
                index={props.index}
                detached={true}
                selected={selected}
                block={props.block}
                onAddBlock={nope}
                onChangeBlock={(id, { text }) => {
                  props.onChangeBlock(block, {
                    ...props.data,
                    text,
                  });
                }}
                onDeleteBlock={nope}
                onFocusPreviousBlock={nope}
                onFocusNextBlock={nope}
                onSelectBlock={nope}
                onMutateBlock={nope}
                data={props.data}
                toolbarId={toolbarId}
              />
            </div>
          </Segment>
          <Segment secondary={!selected}>
            <ConnectedChart
              data={{
                chartSources: data.chartSources,
                data_query: data.data_query,
                download_button: data.download_button,
                has_data_query_by_context: data.has_data_query_by_context,
                has_data_query_by_provider: data.has_data_query_by_provider,
                use_live_data: data.use_live_data,
                vis_url: data.vis_url,
                with_sources: data.with_sources,
              }}
              hoverFormatXY={data.hover_format_xy}
              withSources={true}
              width={data.width}
              height={data.height}
            />
          </Segment>
        </Segment.Group>
      </Form>

      <SidebarPortal selected={props.selected}>
        <InlineForm
          schema={schema}
          title={schema.title}
          onChangeField={(id, value) => {
            props.onChangeBlock(props.block, {
              ...props.data,
              [id]: value,
            });
          }}
          formData={props.data}
        />
      </SidebarPortal>
    </>
  );
};

export default Edit;
