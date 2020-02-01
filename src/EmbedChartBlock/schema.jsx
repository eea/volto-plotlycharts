import React from 'react';

const schema = {
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['vis_url', 'hover_format_xy'],
    },
    {
      id: 'sources',
      title: 'Sources',
      fields: ['source'],
    },
  ],
  title: 'Embed Visualization',
  required: ['vis_url'],
  properties: {
    vis_url: {
      widget: 'pick_visualization',
      title: 'Visualization',
    },
    hover_format_xy: {
      type: 'string',
      title: 'Hover format',
      description: (
        <>
          See{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/d3/d3-3.x-api-reference/blob/master/Formatting.md#d3_format"
          >
            D3 format documentation
          </a>
        </>
      ),
    },
    source: {
      type: 'string',
      title: 'Source',
    },
  },
};

export default schema;
