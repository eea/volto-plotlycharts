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
  provider_metadata,
  url_source,
  core_metadata,
  chartData,
  reactChartEditorLib,
) => {
  let array = [];
  let readme = provider_metadata?.readme ? [provider_metadata?.readme] : [];
  const hasDataSources =
    dataSources &&
    Object.keys(dataSources).some(
      (key) => Array.isArray(dataSources[key]) && dataSources[key].length > 0,
    );

  if (hasDataSources) {
    Object.entries(dataSources).forEach(([key, items]) => {
      items.forEach((item, index) => {
        if (!array[index]) array[index] = {};
        array[index][key] = item;
      });
    });
  } else if (chartData?.data && Array.isArray(chartData.data)) {
    // Extract data from traces when dataSources is empty
    const allTraceData = [];
    for (const trace of chartData.data) {
      const traceData = processTraceData(
        trace,
        dataSources || {},
        reactChartEditorLib,
      );
      allTraceData.push(traceData);
    }
    // Process all trace data
    if (
      allTraceData.length > 0 &&
      !allTraceData.every((data) => data.length === 0)
    ) {
      const maxLength = Math.max(...allTraceData.map((data) => data.length));

      for (let i = 0; i < maxLength; i++) {
        if (!array[i]) array[i] = {};

        allTraceData.forEach((traceData) => {
          if (traceData[i]) {
            Object.keys(traceData[i]).forEach((key) => {
              if (
                traceData[i][key] !== null &&
                traceData[i][key] !== undefined
              ) {
                array[i][key] = traceData[i][key];
              }
            });
          }
        });
      }
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

  if (
    metadataFlags.hasDataProvenance ||
    metadataFlags.hasOtherOrganisation ||
    metadataFlags.hasTemporalCoverage ||
    metadataFlags.hasGeoCoverage ||
    metadataFlags.hasPublisher
  ) {
    Object.entries(spreadCoreMetadata(core_metadata)).forEach(
      ([key, items]) => {
        items.forEach((item, index) => {
          if (key.includes('data_provenance') || key.includes('Sources')) {
            if (!arrays.data_provenance_array[index])
              arrays.data_provenance_array[index] = {};
            arrays.data_provenance_array[index][key] = item;
          }
          if (
            key.includes('other_organisation') ||
            key.includes('Other organisations involved')
          ) {
            if (!arrays.other_organisation_array[index])
              arrays.other_organisation_array[index] = {};
            arrays.other_organisation_array[index][key] = item;
          }
          if (
            key.includes('temporal_coverage') ||
            key.includes('Temporal coverage')
          ) {
            if (!arrays.temporal_coverage_array[index])
              arrays.temporal_coverage_array[index] = {};
            arrays.temporal_coverage_array[index][key] = item;
          }
          if (
            key.includes('geo_coverage') ||
            key.includes('Geographical coverage')
          ) {
            if (!arrays.geo_coverage_array[index])
              arrays.geo_coverage_array[index] = {};
            arrays.geo_coverage_array[index][key] = item;
          }
          if (key.includes('publisher') || key.includes('Publisher')) {
            if (!arrays.publisher_array[index])
              arrays.publisher_array[index] = {};
            arrays.publisher_array[index][key] = item;
          }
        });
      },
    );
  }

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
