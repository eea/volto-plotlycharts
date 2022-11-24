/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import downloadSVG from '../static/download-cloud-fill.svg';

import { trackLink } from '@eeacms/volto-matomo/utils';

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

  str = insertEmptyRows(str, 1);

  if (readme && readme.lenght > 0) {
    readme.forEach((text) => {
      str += text + '\r\n';
    });

    str = insertEmptyRows(str, 1);
  }

  return str;
}

function convertMatrixToCSV(matrix, readme = []) {
  let str = '';

  matrix.forEach((array) => {
    str += getHeaders(Object.keys(array[0]));
    str += getData(array);

    str = insertEmptyRows(str, 1);
  });

  str = insertEmptyRows(str, 1);

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
    let link = document.createElement('a');
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      if (document) {
        let url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', exportedFilenmae);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
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
    if (core_metadata[key].length > 0) {
      core_metadata[key].forEach((item) => {
        Object.keys(item).forEach((subkey) => {
          if (subkey !== '@id' && subkey !== 'value') {
            if (!spread_metadata[`${renameKey(key)}`]) {
              spread_metadata[`${renameKey(key)}`] = [' '];
            } else {
              spread_metadata[`${renameKey(key)}`].push(' ');
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
  const coreMaxRows = Object.values(spread_metadata).reduce((a, b) =>
    a.length > b.length ? a : b,
  ).length;

  let evenMatrix = spread_metadata;
  Object.entries(evenMatrix).forEach(([key, items]) => {
    if (items.length < coreMaxRows) {
      for (let i = items.length; i < coreMaxRows; i++) {
        items.push('');
      }
    }
  });
  return evenMatrix;
};

const Download = (props) => {
  const {
    // sources,
    // className,
    title,
    provider_data,
    provider_metadata,
    providers_data,
    providers_metadata,
    core_metadata,
    url_source,
  } = props;

  const handleDownloadData = () => {
    let array = [];
    let data_provenance_array = [];
    let other_organisation_array = [];
    let temporal_coverage_array = [];
    let geo_coverage_array = [];
    let publisher_array = [];

    let readme = provider_metadata?.readme ? [provider_metadata?.readme] : [];
    const mappedData = {
      ...provider_data,
    };
    Object.entries(mappedData).forEach(([key, items]) => {
      items.forEach((item, index) => {
        if (!array[index]) array[index] = {};
        array[index][key] = item;
      });
    });

    const hasDataProvenance = core_metadata?.data_provenance?.length > 0;
    const hasOtherOrganisation = core_metadata?.other_organisations?.length > 0;
    const hasTemporalCoverage = core_metadata?.temporal_coverage?.length > 0;
    const hasGeoCoverage = core_metadata?.geo_coverage?.length > 0;
    const hasPublisher = core_metadata?.publisher?.length > 0;

    if (
      hasDataProvenance ||
      hasOtherOrganisation ||
      hasTemporalCoverage ||
      hasGeoCoverage ||
      hasPublisher
    ) {
      Object.entries(spreadCoreMetadata(core_metadata)).forEach(
        ([key, items]) => {
          items.forEach((item, index) => {
            if (key.includes('data_provenance') || key.includes('Sources')) {
              if (!data_provenance_array[index])
                data_provenance_array[index] = {};
              data_provenance_array[index][key] = item;
            }
            if (
              key.includes('other_organisation') ||
              key.includes('Other organisations involved')
            ) {
              if (!other_organisation_array[index])
                other_organisation_array[index] = {};
              other_organisation_array[index][key] = item;
            }
            if (
              key.includes('temporal_coverage') ||
              key.includes('Temporal coverage')
            ) {
              if (!temporal_coverage_array[index])
                temporal_coverage_array[index] = {};
              temporal_coverage_array[index][key] = item;
            }
            if (
              key.includes('geo_coverage') ||
              key.includes('Geographical coverage')
            ) {
              if (!geo_coverage_array[index]) geo_coverage_array[index] = {};
              geo_coverage_array[index][key] = item;
            }
            if (key.includes('publisher') || key.includes('Publisher')) {
              if (!publisher_array[index]) publisher_array[index] = {};
              publisher_array[index][key] = item;
            }
          });
        },
      );
    }

    const data_csv = convertToCSV(array, readme);

    const data_provenance_csv = hasDataProvenance
      ? convertToCSV(data_provenance_array, [], true)
      : '';
    const other_organisation_csv = hasOtherOrganisation
      ? convertToCSV(other_organisation_array, [], true)
      : '';
    const temporal_coverage_csv = hasTemporalCoverage
      ? convertToCSV(temporal_coverage_array, [], true)
      : '';
    const geo_coverage_csv = hasGeoCoverage
      ? convertToCSV(geo_coverage_array, [], true)
      : '';
    const publisher_csv = hasPublisher
      ? convertToCSV(publisher_array, [], true)
      : '';

    const download_source_csv = convertToCSV(
      [{ 'Downloaded from :': ' ', url: url_source }],
      [],
      true,
    );

    const csv =
      data_csv +
      download_source_csv +
      data_provenance_csv +
      publisher_csv +
      other_organisation_csv +
      geo_coverage_csv +
      temporal_coverage_csv;
    exportCSVFile(csv, title);
  };

  const handleDownloadMultipleData = () => {
    let array = [];
    let readme = [];
    Object.keys(providers_data).forEach((pKey, pIndex) => {
      if (!array[pIndex]) array[pIndex] = [];
      Object.entries(providers_data[pKey]).forEach(([key, items]) => {
        items.forEach((item, index) => {
          if (!array[pIndex][index]) array[pIndex][index] = {};
          array[pIndex][index][key] = item;
          index++;
        });
      });
    });
    Object.keys(providers_metadata).forEach((pKey) => {
      if (providers_metadata[pKey].readme) {
        readme.push(providers_metadata[pKey].readme);
      }
    });
    const csv = convertMatrixToCSV(array, readme);
    exportCSVFile(csv, title);
  };

  return (
    <>
      <div className="plotly-download-container">
        {provider_data && (
          <img
            className="discreet plotly-download-button"
            title="Download data"
            alt="Download data"
            onClick={() => handleDownloadData()}
            src={downloadSVG}
          />
        )}

        {providers_data && (
          <img
            className="discreet plotly-download-button"
            title="Download data"
            alt="Download data"
            onClick={() => handleDownloadMultipleData()}
            src={downloadSVG}
          />
        )}
      </div>
    </>
  );
};

export default Download;
