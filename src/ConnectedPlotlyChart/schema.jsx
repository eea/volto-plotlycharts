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
  ],

  properties: {
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
