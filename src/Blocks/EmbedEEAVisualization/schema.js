import React from 'react';

const Schema = (props) => {
  return {
    title: 'Embed EEA visualization',

    fieldsets: [
      {
        id: 'default',
        title: 'Default',
        fields: ['vis_url', 'height', 'hover_format_xy', 'show_sources'],
      },
      {
        id: 'download',
        title: 'Download',
        fields: [
          'download_button',
          // ...(hasSources ? ['include_sources_download'] : []),
          // ...(hasOtherOrg ? ['include_other_org_download'] : []),
          // ...(hasTemporalCoverage
          //   ? ['include_temporal_coverage_download']
          //   : []),
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
      height: {
        title: 'Height',
        type: 'number',
        default: 450,
      },
      download_button: {
        title: 'Toggle download',
        type: 'boolean',
      },
      // include_sources_download: {
      //   title: 'Download sources',
      //   description: 'Include sources in the dowloaded CSV',
      //   choices: data_provenance_options,
      //   isMulti: true,
      // },
      // include_other_org_download: {
      //   title: 'Download other organisations',
      //   description: 'Include other organisations in the dowloaded CSV',
      //   choices: other_organisations_options,
      //   isMulti: true,
      // },
      // include_temporal_coverage_download: {
      //   title: 'Download temporal coverage',
      //   description: 'Include temporal coverage in the dowloaded CSV',
      //   choices: temporal_coverage_options,
      //   isMulti: true,
      // },
      show_sources: {
        title: 'Toggle sources',
        type: 'boolean',
      },
      has_data_query_by_context: {
        title: 'Use queries from context',
        description: 'Will use Criteria queries from context (this page)',
        type: 'boolean',
      },
      data_query: {
        title: 'Block Query',
        description:
          'Query data on this block. If context queries are present, block queries will be overridden.',
        widget: 'data_query',
      },
    },

    required: ['vis_url'],
  };
};

export default Schema;
