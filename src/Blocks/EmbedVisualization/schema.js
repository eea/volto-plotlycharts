import React from 'react';

export default {
  title: 'Embed EEA visualization',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['vis_url', 'hover_format_xy'],
    },
    {
      id: 'toolbar',
      title: 'Toolbar',
      fields: [
        'with_notes',
        'with_sources',
        'with_more_info',
        'download_button',
        'with_share',
        'with_enlarge',
      ],
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
    with_notes: {
      title: 'Show notes',
      type: 'boolean',
      defaultValue: true,
    },
    with_sources: {
      title: 'Show sources',
      description: 'Will show sources set in this page Data provenance',
      type: 'boolean',
      defaultValue: true,
    },
    with_more_info: {
      title: 'Show more info',
      type: 'boolean',
      defaultValue: true,
    },
    download_button: {
      title: 'Show download button',
      type: 'boolean',
      defaultValue: true,
    },
    with_share: {
      title: 'Show share button',
      type: 'boolean',
      defaultValue: true,
    },
    with_enlarge: {
      title: 'Show enlarge button',
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
