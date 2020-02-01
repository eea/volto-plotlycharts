import React from 'react';
import { SidebarPortal } from '@plone/volto/components'; // EditBlock
import { BlockEditForm } from 'volto-addons/BlockForm';
import schema from './schema';

const ChartEmbedSidebar = ({ selected, data, onChangeBlock, block }) => (
  <SidebarPortal selected={selected}>
    <BlockEditForm
      schema={schema}
      title={schema.title}
      onChangeField={(id, value) => {
        onChangeBlock(block, { ...data, [id]: value });
      }}
      formData={data}
    />
  </SidebarPortal>
);

export default ChartEmbedSidebar;
