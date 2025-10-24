import isString from 'lodash/isString';
import { trackLink } from '@eeacms/volto-matomo/utils';

function downloadDataURL(dataURL, filename) {
  // Create a temporary anchor element
  const a = document.createElement('a');
  a.href = dataURL;
  a.download = filename;

  // Simulate a click event to trigger the download
  const clickEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: false,
  });
  a.dispatchEvent(clickEvent);
}

function getHeaders(headers, onlySectionHeader = false) {
  let str = '';
  if (!onlySectionHeader) {
    headers.forEach((header) => {
      if (str !== '') str += ',';
      if (header.includes(',')) {
        str += `"${header}"`;
      } else {
        str += header;
      }
    });
    str = insertEmptyRows(str, 1); //insert empty row after data headers
    return str + '\r\n';
  } else {
    str += headers[0];
    return str;
  }
}

function getData(array) {
  let str = '';
  for (let i = 0; i < array.length; i++) {
    let j = 0;
    let row = '';
    for (let key in array[i]) {
      const column = array[i][key];
      if (j > 0) row += ',';
      if (
        (typeof column === 'number' && column.toString().includes(',')) ||
        (typeof column === 'string' && column.includes(','))
      ) {
        row += `"${column}"`;
      } else {
        row += column;
      }
      j++;
    }

    str += row + '\r\n';
  }

  return str;
}

const insertEmptyRows = (matrix, rows) => {
  for (let i = 0; i < rows; i++) {
    matrix += '\r\n';
  }
  return matrix;
};

function convertToCSV(array, readme = [], noHeaders = false) {
  if (!array.length) {
    return '';
  }
  const headers = Object.keys(array[0]);
  let str = getHeaders(headers, noHeaders);

  str += getData(array);

  str = insertEmptyRows(str, 1); //insert empty row between sections

  if (readme && readme.length > 0) {
    readme.forEach((text) => {
      str += text + '\r\n';
    });
  }

  return str;
}

function convertMatrixToCSV(matrix, readme = []) {
  let str = '';

  matrix.forEach((array) => {
    str += getHeaders(Object.keys(array[0]));
    str += getData(array);
  });

  readme.forEach((text) => {
    str += text + '\r\n';
  });

  return str;
}

function exportCSVFile(csv, title = 'data') {
  let fileTitle = title.toLowerCase().replace(' ', '_');
  let exportedFilenmae = fileTitle.includes('.csv')
    ? fileTitle
    : fileTitle + '.csv';
  trackLink({
    href: window.location.href + exportedFilenmae,
    linkType: 'download',
  });

  let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, exportedFilenmae);
  } else {
    downloadDataURL(URL.createObjectURL(blob), exportedFilenmae);
  }
}

const renameKey = (key) => {
  switch (key) {
    case 'data_provenance':
      return 'Sources';
    case 'other_organisations':
      return 'Other organisations involved';
    case 'temporal_coverage':
      return 'Temporal coverage';
    case 'geo_coverage':
      return 'Geographical coverage';
    case 'publisher':
      return 'Publisher';
    default:
      return key;
  }
};

const spreadCoreMetadata = (core_metadata) => {
  //filter requested metadata and insert head titles
  let spread_metadata = {};
  Object.keys(core_metadata).forEach((key) => {
    if (core_metadata[key]?.length > 0) {
      core_metadata[key].forEach((item) => {
        if (isString(item)) {
          if (!spread_metadata[`${renameKey(key)}`]) {
            spread_metadata[`${renameKey(key)}`] = [' '];
          }
          if (!spread_metadata[key]) {
            spread_metadata[key] = [];
          }
          spread_metadata[key].push(item);
          return;
        }
        Object.keys(item).forEach((subkey) => {
          if (subkey !== '@id' && subkey !== 'value') {
            if (!spread_metadata[`${renameKey(key)}`]) {
              spread_metadata[`${renameKey(key)}`] = [' '];
            } else {
              if (
                spread_metadata[`${renameKey(key)}`].length ===
                spread_metadata[`${key}_${subkey}`]?.length
              ) {
                if (
                  `${key}_${subkey}` === 'temporal_coverage_label' ||
                  `${key}_${subkey}` === 'geo_coverage_label'
                ) {
                  // don't add empty space for temporal and geo coverage
                } else {
                  spread_metadata[`${renameKey(key)}`].push(' ');
                }
              }
            }
            if (!spread_metadata[`${key}_${subkey}`]) {
              spread_metadata[`${key}_${subkey}`] = [item[subkey]];
            } else {
              spread_metadata[`${key}_${subkey}`].push(item[subkey]);
            }
          }
        });
      });
    }
  });

  if (
    spread_metadata?.geo_coverage_label &&
    spread_metadata?.geo_coverage_label.length > 0
  ) {
    //transform geo_coverage_label array to string with comma separation
    const stringedGeoCoverage = spread_metadata.geo_coverage_label.join(', ');
    spread_metadata.geo_coverage_label = [stringedGeoCoverage];
  }

  if (
    spread_metadata?.temporal_coverage_label &&
    spread_metadata?.temporal_coverage_label.length > 0
  ) {
    const stringedTemporalCoverage =
      spread_metadata.temporal_coverage_label.join(', ');
    spread_metadata.temporal_coverage_label = [stringedTemporalCoverage];
  }
  return spread_metadata;
};

function exportZipFile(zipData, title = 'data') {
  let fileTitle = title.toLowerCase().replace(' ', '_');
  let exportedFilename = fileTitle.includes('.zip')
    ? fileTitle
    : fileTitle + '.zip';

  trackLink({
    href: window.location.href + exportedFilename,
    linkType: 'download',
  });

  let blob = new Blob([zipData], { type: 'application/zip' });
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, exportedFilename);
  } else {
    downloadDataURL(URL.createObjectURL(blob), exportedFilename);
  }
}

function groupDataByDataset(chartData) {
  const datasets = {};

  if (!chartData.data || !Array.isArray(chartData.data)) {
    return { default: chartData };
  }

  chartData.data.forEach((trace) => {
    const dataset = trace?.dataset;
    if (dataset && !datasets[dataset]) {
      datasets[dataset] = {
        data: [],
        layout: chartData.layout,
        dataSources: {},
        name: dataset, // Use dataset ID as name
      };
    }
    if (dataset) datasets[dataset].data.push(trace);
  });

  return datasets;
}

function processTraceData(trace, dataSources, reactChartEditorLib) {
  let processedData = [];

  // Collect all columns used by the trace
  const usedColumns = new Set();

  const { getAttrsPath, constants, getSrcAttr } = reactChartEditorLib;

  // Get all data attributes from constants.TRACE_SRC_ATTRIBUTES
  const traceDataAttrs = getAttrsPath(trace, constants.TRACE_SRC_ATTRIBUTES);

  // For each data attribute, get the corresponding src attribute using getSrcAttr
  Object.entries(traceDataAttrs).forEach(([dataAttrPath, dataValue]) => {
    const srcAttr = getSrcAttr(trace, dataAttrPath);

    if (srcAttr && srcAttr.value && dataSources[srcAttr.value]) {
      usedColumns.add(srcAttr.value);
    }
  });

  // Add columns from transforms
  if (trace.transforms && Array.isArray(trace.transforms)) {
    trace.transforms.forEach((transform) => {
      if (transform.targetsrc && dataSources[transform.targetsrc]) {
        usedColumns.add(transform.targetsrc);
      }
    });
  }

  // If no specific columns found, use all available data sources
  if (usedColumns.size === 0) {
    Object.keys(dataSources).forEach((key) => {
      if (Array.isArray(dataSources[key])) {
        usedColumns.add(key);
      }
    });
  }

  const maxLength = Math.max(
    ...Array.from(usedColumns).map((col) =>
      dataSources[col] ? dataSources[col].length : 0,
    ),
  );

  for (let i = 0; i < maxLength; i++) {
    const row = {};
    usedColumns.forEach((col) => {
      if (dataSources[col] && dataSources[col][i] !== undefined) {
        row[col] = dataSources[col][i];
      }
    });
    processedData.push(row);
  }

  // Ensure all rows have the same columns (fill missing columns with empty values)
  const allColumns = new Set();
  processedData.forEach((row) => {
    Object.keys(row).forEach((col) => allColumns.add(col));
  });

  processedData.forEach((row) => {
    allColumns.forEach((col) => {
      if (!(col in row)) {
        row[col] = '';
      }
    });
  });

  // Apply transforms if they exist
  if (trace.transforms && Array.isArray(trace.transforms)) {
    trace.transforms.forEach((transform) => {
      processedData = applyTransform(processedData, transform);
    });
  }

  return processedData;
}

function applyTransform(data, transform) {
  if (!transform.type || !transform.targetsrc) {
    return data;
  }

  switch (transform.type) {
    case 'filter':
      return applyFilterTransform(data, transform);
    case 'sort':
      return applySortTransform(data, transform);
    case 'aggregate':
      return applyAggregateTransform(data, transform);
    case 'split':
      return applySplitTransform(data, transform);
    default:
      return data;
  }
}

function applyFilterTransform(data, transform) {
  if (transform.value === null || transform.value === undefined) {
    return data;
  }

  const operation = transform.operation || '=';
  const targetCol = transform.targetsrc;

  return data.filter((row) => {
    const value = row[targetCol];

    switch (operation) {
      case '=':
        return value === transform.value;
      case '!=':
        return value !== transform.value;
      case '>':
        return value > transform.value;
      case '<':
        return value < transform.value;
      case '>=':
        return value >= transform.value;
      case '<=':
        return value <= transform.value;
      case 'contains':
        return String(value).includes(String(transform.value));
      default:
        return value === transform.value;
    }
  });
}

function applySortTransform(data, transform) {
  const targetCol = transform.targetsrc;
  const order = transform.order || 'ascending';

  return [...data].sort((a, b) => {
    const aVal = a[targetCol];
    const bVal = b[targetCol];

    let comparison = 0;
    if (aVal > bVal) comparison = 1;
    else if (aVal < bVal) comparison = -1;

    return order === 'ascending' ? comparison : -comparison;
  });
}

function applyAggregateTransform(data, transform) {
  if (!transform.groups || !transform.aggregations) {
    return data;
  }

  const groups = {};

  // Group data by the specified column
  data.forEach((row) => {
    const groupKey = row[transform.groups];
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(row);
  });

  // Apply aggregations
  const aggregatedData = [];

  Object.keys(groups).forEach((groupKey) => {
    const groupData = groups[groupKey];
    const aggregatedRow = { [transform.groups]: groupKey };

    transform.aggregations.forEach((agg) => {
      const values = groupData
        .map((row) => row[agg.target])
        .filter((v) => v !== null && v !== undefined);

      switch (agg.func) {
        case 'avg':
          aggregatedRow[agg.target] =
            values.reduce((sum, val) => sum + val, 0) / values.length;
          break;
        case 'sum':
          aggregatedRow[agg.target] = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'min':
          aggregatedRow[agg.target] = Math.min(...values);
          break;
        case 'max':
          aggregatedRow[agg.target] = Math.max(...values);
          break;
        case 'count':
          aggregatedRow[agg.target] = values.length;
          break;
        default:
          aggregatedRow[agg.target] = values[0];
      }
    });

    aggregatedData.push(aggregatedRow);
  });

  return aggregatedData;
}

function applySplitTransform(data, transform) {
  if (!transform.groups) {
    return data;
  }

  // Split transform divides data into groups based on unique values
  // For CSV export, we'll preserve the grouping information
  return data.map((row) => ({
    ...row,
    _split_group: row[transform.groups],
  }));
}

export {
  convertToCSV,
  convertMatrixToCSV,
  downloadDataURL,
  exportCSVFile,
  exportZipFile,
  groupDataByDataset,
  processTraceData,
  applyTransform,
  applyFilterTransform,
  applySortTransform,
  applyAggregateTransform,
  applySplitTransform,
  spreadCoreMetadata,
  renameKey,
};
