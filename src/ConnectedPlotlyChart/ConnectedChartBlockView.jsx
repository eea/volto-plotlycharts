import React from 'react';
import ConnectedChart from './ConnectedChart';
import { withBlockData } from 'volto-datablocks/hocs';

// Not using these because we must set a CSS property on the icon:
// import downloadSVG from '@plone/volto/icons/download.svg';
// import { Icon as VoltoIcon } from '@plone/volto/components';

import DownloadIcon from '../DownloadIcon';

import { connect } from 'react-redux';
import { settings } from '~/config';

// NOTE: This file is inspired from
// forests-frontend/src/develop/volto-datablocks/src/components/manage/Blocks/SourcesBlock/View.jsx
// after the develop directory is populated by `$ yarn develop`
// This file does not include all the discodata integration of download links.
// This file has some small improvements in comparison with the original file
// besides the different ConnectedChartBlockView component.

function convertToCSV(objArray) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';

  for (var i = 0; i < array.length; i++) {
    var line = '';
    for (var index in array[i]) {
      if (line !== '') line += ',';

      line += array[i][index];
    }

    str += line + '\r\n';
  }

  return str;
}

function exportCSVFile(items, fileTitle) {
  // Convert Object to JSON
  let jsonObject = JSON.stringify(items);

  let csv = convertToCSV(jsonObject);

  let exportedFilenmae = fileTitle + '.csv' || 'export.csv';

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

const ConnectedChartBlockView = (props) => {
  const { data = {}, data_providers } = props;

  const download = React.useCallback(() => {
    const providerUrl = data?.chartData?.provider_url;

    const connectorsData = {};
    const connectorData =
      data_providers?.data?.[`${providerUrl}/@connector-data`];

    if (connectorData) {
      let array = [];
      connectorData &&
        Object.entries(connectorData).forEach(([key, items]) => {
          items.forEach((item, index) => {
            if (!array[index]) array[index] = {};
            array[index][key] = item;
          });
        });
      exportCSVFile(
        array,
        providerUrl.endsWith('.csv') ? providerUrl.slice(0, -4) : providerUrl,
      );
      return;
    }

    if (connectorsData) {
      let title = '';
      let array = [];
      Object.entries(connectorsData).forEach(([connectorKey, connector]) => {
        title += connectorKey + ' & ';
        Object.entries(connector).forEach(([key, items]) => {
          items.forEach((item, index) => {
            if (!array[index]) array[index] = {};
            array[index][key] = item;
          });
        });
      });
      exportCSVFile(array, title.slice(0, -3));
      return;
    }

    if (!providerUrl) return;

    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute(
      'href',
      `${settings.apiPath}${providerUrl}/@@download`,
    );
    dlAnchorElem.click();
  }, [data?.chartData?.provider_url, data_providers?.data]);

  const hasSources =
    Array.isArray(data.chartSources) && data.chartSources.length > 0;
  const multipleSources = hasSources && data.chartSources.length > 1;

  // an alternative to data.url is data.chartData.provider_url
  const downloadUrl = `${data.url}/@@download/file`;

  return (
    <div className="connected-chart-container">
      <ConnectedChart data={data} />

      {/* TODO: extract the following into a SourcesDownloadLinks component to
      be used also in the edit component of the block whose view component is
      the above. */}
      <div style={{ color: 'gray', textAlign: 'center', paddingTop: '0.5rem' }}>
        <a
          href={downloadUrl} // this is used only for tooltip because we handle onClick below
          target="_blank" // because of this there is a ...
          rel="noreferrer" // security risk without this
          style={{ verticalAlign: 'middle' }}
          onClick={(e) => {
            download();

            e.preventDefault();
            return false;
          }}
        >
          <DownloadIcon />{' '}
          {!hasSources && (
            <span style={{ verticalAlign: 'middle' }}>Download the data</span>
          )}
        </a>
        {hasSources && multipleSources && <span>Sources: </span>}
        {hasSources && !multipleSources && <span>Source: </span>}
        {hasSources &&
          data.chartSources.map((s, i) => {
            return (
              <span style={{ verticalAlign: 'middle' }}>
                <a href={s.chart_source_link}> {s.chart_source}</a>
                {i !== data.chartSources.length - 1 && <span> & </span>}
              </span>
            );
          })}
        <br />
      </div>
    </div>
  );
};

export default connect((state /*, props */) => {
  return {
    data_providers: state.data_providers,
  };
}, {})(React.memo(withBlockData(ConnectedChartBlockView)));
