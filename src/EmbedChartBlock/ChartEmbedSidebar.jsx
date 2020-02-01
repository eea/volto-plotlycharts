import React from 'react';

import { Field, SidebarPortal } from '@plone/volto/components'; // EditBlock
import { Segment } from 'semantic-ui-react';

import MultiValuesEdit from 'volto-datablocks/DataConnectedBlock/MultiValuesEdit';
import { SourceEdit } from 'volto-datablocks/Sources';
import PickVisualization from 'volto-plotlycharts/PickVisualization';

const ChartEmbedSidebar = ({
  block,
  data,
  onChangeBlock,
  schema,
  selected,
  title,
}) => (
  <SidebarPortal selected={selected}>
    <Segment.Group raised>
      <header className="header pulled">
        <h2>{title || 'Edit chart options'}</h2>
      </header>
      <Segment className="form sidebar-image-data">
        <PickVisualization
          id={`vis-${block}`}
          onLoadChartData={chartData =>
            onChangeBlock(block, {
              ...data,
              chartData,
            })
          }
          currentChartData={data?.chartData}
          onChange={url =>
            onChangeBlock(block, {
              ...data,
              vis_url: url,
            })
          }
          value={data?.vis_url || ''}
        />
        <Field
          title="Hover format"
          id="hover-format"
          type="text"
          value={data.hover_format_xy || ''}
          description={
            <div>
              See{' '}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/d3/d3-3.x-api-reference/blob/master/Formatting.md#d3_format"
              >
                d3 format documentation
              </a>
            </div>
          }
          required={false}
          onChange={(e, d) =>
            onChangeBlock(block, {
              ...data,
              hover_format_xy: d,
            })
          }
        />
        <SourceEdit data={data} onChangeBlock={onChangeBlock} block={block} />
        <MultiValuesEdit
          schema={schema || {}}
          onChange={data => onChangeBlock(block, data)}
          data={data}
        />
      </Segment>
    </Segment.Group>
  </SidebarPortal>
);

export default ChartEmbedSidebar;
