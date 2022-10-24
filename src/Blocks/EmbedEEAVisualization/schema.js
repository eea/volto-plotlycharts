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
      title: 'Dynamic Chart',
      fields: [
        // 'has_data_query_by_context',
        // 'has_data_query_by_provider',
        // 'data_query',
      ],
    },
  ],

  properties: {
    vis_url: {
      widget: 'object_by_path',
      title: 'Visualization',
    },
    // use_live_data: {
    //   type: 'boolean',
    //   title: 'Use live data',
    //   defaultValue: true,
    // },
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
      defaultValue: true,
    },
    show_sources: {
      title: 'Toggle sources',
      type: 'boolean',
      defaultValue: true,
    },

    //do this as in volto-eea-map
    // has_data_query_by_context: {
    //   title: 'Has data_query by context',
    //   type: 'boolean',
    //   defaultValue: true,
    // },
    // has_data_query_by_provider: {
    //   title: 'Has data_query by provider',
    //   type: 'boolean',
    //   defaultValue: true,
    // },
    // data_query: {
    //   title: 'Query',
    //   widget: 'data_query',
    // },
  },

  required: ['vis_url'],
};
