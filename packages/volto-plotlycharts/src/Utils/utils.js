import {
  convertToCSV,
  processTraceData,
  spreadCoreMetadata,
} from '@eeacms/volto-plotlycharts/helpers/csvString';

export const generateFinalCSV = (
  array,
  readme,
  metadataFlags,
  metadataArrays,
  url_source,
) => {
  const data_csv = convertToCSV(array, readme);

  const data_provenance_csv = metadataFlags.hasDataProvenance
    ? convertToCSV(metadataArrays.data_provenance_array, [], true)
    : '';
  const other_organisation_csv = metadataFlags.hasOtherOrganisation
    ? convertToCSV(metadataArrays.other_organisation_array, [], true)
    : '';
  const temporal_coverage_csv = metadataFlags.hasTemporalCoverage
    ? convertToCSV(metadataArrays.temporal_coverage_array, [], true)
    : '';
  const geo_coverage_csv = metadataFlags.hasGeoCoverage
    ? convertToCSV(metadataArrays.geo_coverage_array, [], true)
    : '';
  const publisher_csv = metadataFlags.hasPublisher
    ? convertToCSV(metadataArrays.publisher_array, [], true)
    : '';

  const download_source_csv = convertToCSV(
    [{ 'Downloaded from: ': url_source }],
    [],
    true,
  );

  return (
    download_source_csv +
    publisher_csv +
    other_organisation_csv +
    data_provenance_csv +
    geo_coverage_csv +
    temporal_coverage_csv +
    data_csv
  );
};

export const generateOriginalCSV = (
  dataSources,
  columns,
  provider_metadata,
  url_source,
  core_metadata,
) => {
  let array = [];
  let sortedDataSources;
  let readme = provider_metadata?.readme ? [provider_metadata?.readme] : [];

  if (columns.length) {
    function findIndex(key) {
      let index = columns.findIndex((column) => column === key);
      if (index === -1) index = columns.length;
      return index;
    }
    sortedDataSources = Object.entries(dataSources).sort(([key1], [key2]) => {
      let index1 = findIndex(key1);
      let index2 = findIndex(key2);
      return index1 - index2;
    });
  } else {
    sortedDataSources = Object.entries(dataSources);
  }

  sortedDataSources.forEach(([key, items]) => {
    items.forEach((item, index) => {
      if (!array[index]) array[index] = {};
      array[index][key] = item;
    });
  });

  const metadataFlags = getMetadataFlags(core_metadata);
  const metadataArrays = processMetadataArrays(core_metadata, metadataFlags);

  return generateFinalCSV(
    array,
    readme,
    metadataFlags,
    metadataArrays,
    url_source,
  );
};

export const getMetadataFlags = (core_metadata) => ({
  hasDataProvenance: core_metadata.data_provenance?.length > 0,
  hasOtherOrganisation: core_metadata.other_organisations?.length > 0,
  hasTemporalCoverage: core_metadata.temporal_coverage?.length > 0,
  hasGeoCoverage: core_metadata.geo_coverage?.length > 0,
  hasPublisher: core_metadata.publisher?.length > 0,
});

export const processMetadataArrays = (core_metadata, metadataFlags) => {
  const arrays = {
    data_provenance_array: [],
    other_organisation_array: [],
    temporal_coverage_array: [],
    geo_coverage_array: [],
    publisher_array: [],
  };

  // Skip processing if no relevant metadata flags are set
  if (!Object.values(metadataFlags).some(Boolean)) {
    return arrays;
  }

  const metadataMappings = [
    {
      keys: ['data_provenance', 'Sources'],
      target: 'data_provenance_array',
      flag: 'hasDataProvenance',
    },
    {
      keys: ['other_organisation', 'Other organisations involved'],
      target: 'other_organisation_array',
      flag: 'hasOtherOrganisation',
    },
    {
      keys: ['temporal_coverage', 'Temporal coverage'],
      target: 'temporal_coverage_array',
      flag: 'hasTemporalCoverage',
    },
    {
      keys: ['geo_coverage', 'Geographical coverage'],
      target: 'geo_coverage_array',
      flag: 'hasGeoCoverage',
    },
    {
      keys: ['publisher', 'Publisher'],
      target: 'publisher_array',
      flag: 'hasPublisher',
    },
  ];

  Object.entries(spreadCoreMetadata(core_metadata)).forEach(([key, items]) => {
    items.forEach((item, index) => {
      metadataMappings.forEach(({ keys, target, flag }) => {
        if (metadataFlags[flag] && keys.some((k) => key.includes(k))) {
          if (!arrays[target][index]) {
            arrays[target][index] = {};
          }
          arrays[target][index][key] = item;
        }
      });
    });
  });

  return arrays;
};

export const generateCSVForDataset = (
  dataSources,
  datasetData,
  provider_metadata,
  core_metadata,
  url_source,
  reactChartEditorLib,
) => {
  let array = [];
  let readme = provider_metadata?.readme ? [provider_metadata?.readme] : [];

  // Collect all trace data separately
  const allTraceData = [];
  for (const trace of datasetData.data) {
    const traceData = processTraceData(trace, dataSources, reactChartEditorLib);
    allTraceData.push(traceData);
  }

  // If no processed data from traces, fall back to original data sources
  if (
    allTraceData.length === 0 ||
    allTraceData.every((data) => data.length === 0)
  ) {
    Object.entries(dataSources).forEach(([key, items]) => {
      items.forEach((item, index) => {
        if (!array[index]) array[index] = {};
        array[index][key] = item;
      });
    });
  } else {
    const maxLength = Math.max(...allTraceData.map((data) => data.length));

    for (let i = 0; i < maxLength; i++) {
      if (!array[i]) array[i] = {};

      allTraceData.forEach((traceData) => {
        if (traceData[i]) {
          Object.keys(traceData[i]).forEach((key) => {
            if (traceData[i][key] !== null && traceData[i][key] !== undefined) {
              array[i][key] = traceData[i][key];
            }
          });
        }
      });
    }
  }

  const metadataFlags = getMetadataFlags(core_metadata);
  const metadataArrays = processMetadataArrays(core_metadata, metadataFlags);

  return generateFinalCSV(
    array,
    readme,
    metadataFlags,
    metadataArrays,
    url_source,
  );
};
