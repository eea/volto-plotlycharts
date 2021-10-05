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
      fields: ['url', 'hover_format_xy', 'align', 'min_width'],
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
    {
      id: 'custom',
      title: 'Custom Raw Data',
      fields: [
        'custom_chart_toggle',
        'custom_chart_data',
        'custom_chart_layout',
      ],
    },
  ],

  properties: {
    custom_chart_toggle: {
      title: 'Use Custom Data',
      type: 'boolean',
      defaultValue: false,
    },
    custom_chart_data: {
      widget: 'text',
      title: 'Data Raw',
    },
    custom_chart_layout: {
      widget: 'text',
      title: 'Layout Raw',
    },
    url: {
      widget: 'pick_provider',
      title: 'Data provider',
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
