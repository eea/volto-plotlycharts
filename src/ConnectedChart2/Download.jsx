/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import downloadSVG from '../static/download-cloud-fill.svg';
// import { Icon } from '@plone/volto/components';

import { trackLink } from '@eeacms/volto-matomo/utils';
// import { Button } from 'semantic-ui-react';

function getHeaders(headers) {
  let str = '';
  headers.forEach((header) => {
    if (str !== '') str += ',';
    if (header.includes(',')) {
      str += `"${header}"`;
    } else {
      str += header;
    }
  });
  return str + '\r\n';
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

function convertToCSV(array, readme = []) {
  const headers = Object.keys(array[0]);
  let str = getHeaders(headers);

  str += getData(array);

  for (let i = 0; i < 5; i++) {
    str += '\r\n';
  }

  readme.forEach((text) => {
    str += text + '\r\n';
  });

  return str;
}

function convertMatrixToCSV(matrix, readme = []) {
  let str = '';

  matrix.forEach((array) => {
    str += getHeaders(Object.keys(array[0]));
    str += getData(array);
    for (let i = 0; i < 2; i++) {
      str += '\r\n';
    }
  });

  for (let i = 0; i < 3; i++) {
    str += '\r\n';
  }

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

const spreadCoreMetadata = (core_metadata) => {
  let spread_metadata = {};
  Object.keys(core_metadata).forEach((key) => {
    if (core_metadata[key].length > 0) {
      core_metadata[key].forEach((item) => {
        Object.keys(item).forEach((subkey) => {
          if (!spread_metadata['EEA Core Metadata']) {
            spread_metadata['EEA Core Metadata'] = [' '];
          } else {
            spread_metadata['EEA Core Metadata'].push(' ');
          }
          if (!spread_metadata[`${key}_${subkey}`]) {
            spread_metadata[`${key}_${subkey}`] = [item[subkey]];
          } else {
            spread_metadata[`${key}_${subkey}`].push(item[subkey]);
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
  } = props;

  const handleDownloadData = () => {
    let array = [];
    let core_metadata_array = [];
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
    const hasCoreMetadata =
      core_metadata?.data_provenance?.length > 0 ||
      core_metadata?.other_organisation?.length > 0 ||
      core_metadata?.temporal_coverage?.length > 0;

    if (hasCoreMetadata) {
      Object.entries(spreadCoreMetadata(core_metadata)).forEach(
        ([key, items]) => {
          items.forEach((item, index) => {
            if (!core_metadata_array[index]) core_metadata_array[index] = {};
            core_metadata_array[index][key] = item;
          });
        },
      );
    }

    const data_csv = convertToCSV(array, readme);
    const core_metadata_csv = hasCoreMetadata
      ? convertToCSV(core_metadata_array, readme)
      : '';
    const csv = hasCoreMetadata ? data_csv + core_metadata_csv : data_csv;
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
