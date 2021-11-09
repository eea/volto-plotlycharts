/*
 * Schema format mostly follows Volto's Form.jsx requirement
 *
 */
import React from 'react';

const SourceSchema = {
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
      type: 'string',
      title: 'Source',
    },
    chart_source_link: {
      type: 'string',
      title: 'Link',
    },
  },

  required: ['source'],
};

const ChartSchema = {
  title: 'Edit chart',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: [
        'url',
        'filterReplaceString',
        'hover_format_xy',
        'align',
        'min_width',
        'raw_data_toggle',
      ],
    },
    {
      id: 'sources',
      title: 'Sources',
      fields: ['chartSources'],
    },
    {
      id: 'source',
      title: 'Source (obsolete)',
      fields: ['chart_source', 'chart_source_link'],
    },
  ],

  properties: {
    raw_data_toggle: {
      title: 'Use Raw Data',
      type: 'boolean',
      defaultValue: false,
      description: (
        <>
          Expects JSON data for data & layout object (See{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://plotly.com/javascript/basic-charts/"
          >
            Plotly charts examples
          </a>
          ). This will override all other settings.
        </>
      ),
    },
    url: {
      widget: 'pick_provider',
      title: 'Data provider',
    },
    filterReplaceString: {
      type: 'string',
      title: 'Filter replace string',
      description:
        'If given, replace only this string in the transforms/filter section',
    },
    chartSources: {
      widget: 'object_list',
      title: 'Sources',
      // this is an invention, should confront with dexterity serializer
      schema: SourceSchema,
    },
    chart_source: {
      type: 'string',
      title: 'Source',
    },
    chart_source_link: {
      type: 'string',
      title: 'Source link',
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
    align: {
      title: 'Alignment',
      widget: 'align',
      type: 'string',
    },
    min_width: {
      title: 'Minimum width',
      type: 'string',
    },
  },

  required: ['url'],
};

export default ChartSchema;
