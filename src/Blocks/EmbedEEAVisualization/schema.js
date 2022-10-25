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
        ],
      },

      {
        id: 'data_query',
        title: 'Data query',
        fields: [
          'enable_queries',
          ...(props.data.enable_queries ? ['data_query_params'] : []),
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
      show_sources: {
        title: 'Toggle sources',
        type: 'boolean',
      },
      enable_queries: {
        title: 'Enable queries',
        description:
          'Will import Criteria from content-type and try to query chart fields.',
        type: 'boolean',
      },
      data_query_params: {
        title: 'Query parameters',
        description:
          'When using page level parameters to filter the chart, please map those to the corresponding field name from the chart service',
        widget: 'data_query_widget',
      },
    },

    required: ['vis_url'],
  };
};

export default Schema;
