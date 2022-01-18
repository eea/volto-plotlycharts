import React from 'react';

const sourceSchema = {
  title: 'Source',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['chart_source', 'chart_source_link'],
    },
  ],

  properties: {
    chart_source: {
      title: 'Source',
      widget: 'textarea',
    },
    chart_source_link: {
      title: 'Link',
      type: 'string',
    },
  },

  required: ['source'],
};

export default {
  title: 'Embed visualization',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['vis_url', 'hover_format_xy', 'height'],
    },
    {
      id: 'sources',
      title: 'Sources',
      fields: ['chartSources', 'download_button'],
    },
    {
      id: 'data_query',
      title: 'Data query',
      fields: ['data_query'],
    },
  ],

  properties: {
    vis_url: {
      widget: 'object_by_path',
      title: 'Visualization',
    },
    hover_format_xy: {
      type: 'string',
      title: 'Hover format',
      placeholder: '.3s',
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
    height: {
      title: 'Height',
      type: 'number',
      default: 450,
    },
    chartSources: {
      widget: 'object_list',
      title: 'Sources',
      schema: sourceSchema,
    },
    download_button: {
      title: 'Download button',
      type: 'boolean',
      defaultValue: true,
    },
    data_query: {
      title: 'Query',
      widget: 'data_query',
    },
  },

  required: ['vis_url'],
};
