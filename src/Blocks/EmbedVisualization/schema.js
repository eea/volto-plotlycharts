import React from 'react';

export default {
  title: 'Embed EEA visualization',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['vis_url', 'hover_format_xy', 'with_sources', 'with_more_info', 'with_notes', 'download_button'],
    },
    {
      id: 'data_query',
      title: 'Data query',
      fields: ['has_data_query_by_context', 'data_query'],
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
    download_button: {
      title: 'Toggle download',
      type: 'boolean',
      defaultValue: true,
    },
    with_sources: {
      title: 'Toggle sources',
      type: 'boolean',
      defaultValue: true,
    },
    with_more_info: {
      title: 'Toggle more info',
      type: 'boolean',
      defaultValue: true,
    },
    with_notes: {
      title: 'Toggle notes',
      type: 'boolean',
      defaultValue: true,
    },
    has_data_query_by_context: {
      title: 'Use queries from context',
      description: 'Will use Criteria queries from context (this page)',
      type: 'boolean',
      defaultValue: true,
    },
    data_query: {
      title: 'Specific block criteria',
      description:
        'Query data on this block. Predefined query criteria options are available only when the taxonomies are present in the site ',
      widget: 'data_query',
    },
  },

  required: ['vis_url'],
};
