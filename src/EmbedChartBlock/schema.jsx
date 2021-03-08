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

const ChartEmbedSchema = {
  title: 'Embed Visualization',

  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['vis_url', 'hover_format_xy', 'min_width'],
    },
    {
      id: 'sources',
      title: 'Sources',
      fields: ['chartSources', 'download_button'],
    },
  ],

  properties: {
    vis_url: {
      widget: 'pick_visualization',
      title: 'Visualization',
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
    chartSources: {
      widget: 'objectlist',
      title: 'Sources',
      // this is an invention, should confront with dexterity serializer
      schema: SourceSchema,
    },
    // chart_source: {
    //   type: 'string',
    //   title: 'Source',
    // },
    download_button: {
      title: 'Download button',
      type: 'boolean',
    },
    // chart_source_link: {
    //   type: 'string',
    //   title: 'Source link',
    // },
    min_width: {
      title: 'Minimum width',
      type: 'string',
    },
  },

  required: ['vis_url'],
};

export default ChartEmbedSchema;
