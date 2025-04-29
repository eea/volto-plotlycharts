const schema = {
  title: 'Embed interactive Chart (Plotly)',
  fieldsets: [
    {
      id: 'default',
      title: 'Default',
      fields: ['vis_url', 'height', 'with_metadata_section'],
    },
    {
      id: 'toolbar',
      title: 'Toolbar',
      fields: [
        'with_notes',
        'with_more_info',
        'download_button',
        'with_share',
        'with_enlarge',
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
      widget: 'internal_url',
      title: 'Visualization',
    },
    height: {
      title: 'Height',
      type: 'number',
    },
    with_metadata_section: {
      title: 'Show metadata section',
      type: 'boolean',
      defaultValue: true,
    },
    with_notes: {
      title: 'Show notes',
      type: 'boolean',
      defaultValue: true,
    },
    with_sources: {
      title: 'Show sources',
      description: 'Will show sources set in this page Data provenance',
      type: 'boolean',
      defaultValue: true,
    },
    with_more_info: {
      title: 'Show more info',
      type: 'boolean',
      defaultValue: true,
    },
    download_button: {
      title: 'Show download button',
      type: 'boolean',
      defaultValue: true,
    },
    with_share: {
      title: 'Show share button',
      type: 'boolean',
      defaultValue: true,
    },
    with_enlarge: {
      title: 'Show enlarge button',
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

  required: ['vis_url'],
};

export default schema;
