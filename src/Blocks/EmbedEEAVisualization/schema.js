import React from 'react';

const Schema = (props) => {
  return {
    title: 'Embed EEA visualization',

    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: [
          'vis_url',
          'height',
          'hover_format_xy',
          'show_sources',
          'download_button',
          ...(props.data.download_button
            ? ['include_core_metadata_download']
            : []),
        ],
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
      download_button: {
        title: 'Toggle download',
        type: 'boolean',
      },
      include_core_metadata_download: {
        title: 'Download core metadata',
        description: 'Include core metadata in the dowloaded CSV',
        type: 'boolean',
      },
      show_sources: {
        title: 'Toggle sources',
        type: 'boolean',
      },
      has_data_query_by_context: {
        title: 'Use queries from context',
        description: 'Will use Criteria queries from context (this page)',
        type: 'boolean',
      },
      has_data_query_by_provider: {
        title: 'Use queries from visualization',
        description: 'Will use Criteria queries from visualization',
        type: 'boolean',
      },
      data_query: {
        title: 'Query',
        widget: 'data_query',
      },
    },

    required: ['vis_url'],
  };
};

export default Schema;