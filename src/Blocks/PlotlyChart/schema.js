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
  title: 'Plotly chart',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['hover_format_xy'],
    },
    {
      id: 'sources',
      title: 'Sources',
      fields: ['chartSources', 'with_sources', 'download_button'],
    },
    {
      id: 'data_query',
      title: 'Data query',
      fields: ['has_data_query_by_context', 'data_query'],
    },
  ],

  properties: {
    hover_format_xy: {
      type: 'string',
      title: 'Hover format',
      placeholder: '',
      description: (
        <>
          See{' '}
          <a
            target="_blank"
            rel="noopener"
            href="https://github.com/d3/d3-3.x-api-reference/blob/master/Formatting.md#d3_format"
          >
            D3 format documentation
          </a>
        </>
      ),
    },
    chartSources: {
      widget: 'object_list',
      title: 'Sources',
      schema: sourceSchema,
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

  required: [],
};
