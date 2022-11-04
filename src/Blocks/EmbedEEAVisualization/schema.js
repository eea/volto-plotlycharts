import React from 'react';

const makeMetadataOptions = (data) => {
  if (data && data.length > 0) {
    return data
      .map((item) => [...Object.keys(item)]) //get all keys, should be the same for all
      .flat(1) // flatten all arrays
      .reduce(function (a, b) {
        if (a.indexOf(b) < 0) a.push(b);
        return a;
      }, []) //remove duplicates. We need only one set of keys
      .map((item) => [item, item]); //map them for choices
  }
  return [];
};

const Schema = (props) => {
  const hasSources =
    props.data_provenance &&
    props.data_provenance.data &&
    props.data_provenance.data.length > 0;
  const hasOtherOrg =
    props.other_organisations && props.other_organisations.length > 0;
  const hasTemporalCoverage =
    props.temporal_coverage &&
    props.temporal_coverage.temporal &&
    props.temporal_coverage.temporal.length > 0;

  const data_provenance_options = makeMetadataOptions(
    props?.data_provenance?.data,
  );

  const temporal_coverage_options = makeMetadataOptions(
    props?.temporal_coverage?.temporal,
  );

  const other_organisations_options = makeMetadataOptions(
    props?.other_organisations,
  );
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
          ...(props.data.download_button
            ? ['include_core_metadata_download']
            : []),
          ...(props.data.download_button &&
          props.data.include_core_metadata_download
            ? [
                ...(hasSources ? ['include_sources_download'] : []),
                ...(hasOtherOrg ? ['include_other_org_download'] : []),
                ...(hasTemporalCoverage
                  ? ['include_temporal_coverage_download']
                  : []),
              ]
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
      include_sources_download: {
        title: 'Download sources',
        description: 'Include sources in the dowloaded CSV',
        choices: data_provenance_options,
        isMulti: true,
      },
      include_other_org_download: {
        title: 'Download other organisations',
        description: 'Include other organisations in the dowloaded CSV',
        choices: other_organisations_options,
        isMulti: true,
      },
      include_temporal_coverage_download: {
        title: 'Download temporal coverage',
        description: 'Include temporal coverage in the dowloaded CSV',
        choices: temporal_coverage_options,
        isMulti: true,
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
