import { trackLink } from '@eeacms/volto-matomo/utils';
import { downloadDataURL } from './index';

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
    let row = '';
    for (let key in array[i]) {
      const column = array[i][key];
      if (row !== '') row += ',';
      if (
        (typeof column === 'number' && column.toString().includes(',')) ||
        (typeof column === 'string' && column.includes(','))
      ) {
        row += `"${column}"`;
      } else {
        row += column;
      }
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
  Object.keys(core_metadata).forEach((key, index) => {
    if (core_metadata[key]?.length > 0) {
      core_metadata[key].forEach((item, jIndex) => {
        Object.keys(item).forEach((subkey, subindex) => {
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
                  spread_metadata[`${renameKey(key)}`].push(` `);
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
    const stringedTemporalCoverage = spread_metadata.temporal_coverage_label.join(
      ', ',
    );
    spread_metadata.temporal_coverage_label = [stringedTemporalCoverage];
  }
  return spread_metadata;
};

export {
  convertToCSV,
  convertMatrixToCSV,
  exportCSVFile,
  spreadCoreMetadata,
  renameKey,
};
