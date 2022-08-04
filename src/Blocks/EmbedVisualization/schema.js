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
      fields: ['vis_url', 'use_live_data', 'hover_format_xy', 'height'],
    },
    {
      id: 'sources',
      title: 'Sources',
      fields: ['chartSources', 'with_sources', 'download_button'],
    },
    {
      id: 'data_query',
      title: 'Data query',
      fields: [
        'has_data_query_by_context',
        'has_data_query_by_provider',
        'data_query',
      ],
    },
  ],

  properties: {
    vis_url: {
      widget: 'object_by_path',
      title: 'Visualization',
    },
    use_live_data: {
      type: 'boolean',
      title: 'Use live data',
      defaultValue: true,
    },
    hover_format_xy: {
      type: 'string',
      title: 'Hover format',
      placeholder: '',
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
    with_sources: {
      title: 'Sources visible',
      type: 'boolean',
      defaultValue: true,
    },
    has_data_query_by_context: {
      title: 'Has data_query by context',
      type: 'boolean',
      defaultValue: true,
    },
    has_data_query_by_provider: {
      title: 'Has data_query by provider',
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
