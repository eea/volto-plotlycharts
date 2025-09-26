import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import React from 'react';
import cx from 'classnames';
import { cloneDeep } from 'lodash';
import { useLocation } from 'react-router-dom';
import { Popup } from 'semantic-ui-react';
import { toPublicURL } from '@plone/volto/helpers';
import {
  exportCSVFile,
  exportZipFile,
  groupDataByDataset,
} from '@eeacms/volto-plotlycharts/helpers/csvString';
import { generateOriginalCSV, generateCSVForDataset } from './utils';

function Download(props) {
  const location = useLocation();
  const { chartData, filters, provider_metadata, reactChartEditorLib } = props;

  const url_source = toPublicURL(location.pathname);

  const {
    title,
    data_provenance,
    other_organisations,
    temporal_coverage,
    publisher,
    geo_coverage,
  } = props.data?.properties || {};

  const core_metadata = {
    data_provenance: data_provenance?.data,
    other_organisations,
    temporal_coverage: temporal_coverage?.temporal,
    publisher,
    geo_coverage: geo_coverage?.geolocation,
  };

  const { dataSources } = props.data?.visualization || {};

  const [open, setOpen] = React.useState(false);

  const handleDownloadData = async () => {
    const datasets = groupDataByDataset(chartData);

    // Check if there's actual dataset information
    const hasDatasetInfo =
      chartData.data &&
      chartData.data.some(
        (trace) => trace.dataset && trace.dataset !== 'default',
      );

    // If no dataset information exists, download only the complete CSV
    if (!hasDatasetInfo) {
      handleDownloadSingleCSV();
      return;
    }

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add individual CSV files for each dataset
      for (const [, datasetData] of Object.entries(datasets)) {
        const csvData = generateCSVForDataset(
          dataSources,
          datasetData,
          provider_metadata,
          core_metadata,
          url_source,
          reactChartEditorLib,
        );
        const fileName = `${datasetData.name || 'data'}.csv`;
        zip.file(fileName, csvData);
      }

      // Add the complete CSV with all data
      const completeCSVData = generateOriginalCSV(
        dataSources,
        provider_metadata,
        url_source,
        core_metadata,
        chartData,
        reactChartEditorLib,
      );
      zip.file(`${title}.csv`, completeCSVData);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipArrayBuffer = await zipBlob.arrayBuffer();
      exportZipFile(zipArrayBuffer, title);
    } catch (error) {
      handleDownloadSingleCSV();
    }
  };

  const handleDownloadSingleCSV = () => {
    const csvData = generateOriginalCSV(
      dataSources,
      provider_metadata,
      url_source,
      core_metadata,
      chartData,
      reactChartEditorLib,
    );
    exportCSVFile(csvData, title);
  };

  const handleDownloadImage = async (type) => {
    const plotly = props.plotlyLib?.default || props.plotlyLib;

    const container = document.createElement('div');
    container.id = '__plotly_download_container__';
    container.style.position = 'absolute';
    container.style.opacity = 0;
    container.style.pointerEvents = 'none';
    container.style.zIndex = -1;
    document.body.appendChild(container);

    const layout = cloneDeep(chartData.layout);
    const size = layout.font?.size || 14;

    if (chartData.height) {
      layout.height = chartData.height;
    }

    let gd = await plotly.newPlot(
      '__plotly_download_container__',
      chartData.data,
      {
        ...layout,
        title: {
          ...(layout.title || {}),
          yref: 'container',
          yanchor: 'top',
          y: 1,
        },
        annotations: [
          ...(layout.annotations || []),
          {
            text: 'annotationmeter',
            showarrow: false,
            font: {
              family: layout.font?.family || 'Roboto, sans-serif',
              size,
              color: layout.font?.color || 'rgb(61, 82, 101)',
            },
          },
        ],
      },
    );

    const gdWidth = gd._fullLayout.width;
    const gdHeight = gd._fullLayout.height;
    const tHeight =
      gd.querySelector('.infolayer .g-gtitle')?.getBoundingClientRect()
        .height || 0;
    const aHeight =
      gd
        .querySelector('.infolayer text[data-unformatted="annotationmeter"]')
        ?.parentElement?.getBoundingClientRect().height || size;

    plotly.purge(gd);

    if (!layout.margin) layout.margin = {};

    const ratio = gdWidth / gdHeight;
    const width = chartData.minWidth || 1000;
    const height = width / ratio;

    if (!filters.length) {
      const gd = await plotly.newPlot(
        '__plotly_download_container__',
        chartData.data,
        layout,
      );

      const base64 = await plotly.toImage(gd, {
        format: type,
        filename: title,
        width,
        height,
      });

      const link = document.createElement('a');
      link.href = base64;
      link.download = `${title}.${type.toLowerCase()}`;
      link.click();

      document.body.removeChild(container);
      return;
    }

    layout.margin.t = tHeight + aHeight * filters.length + 32;

    const cHeight = height - layout.margin.t - (layout.margin.b || 0);

    const pxPercentage = 1 / cHeight;

    filters.forEach((filter, index) => {
      if (!layout.annotations) layout.annotations = [];
      layout.annotations.push({
        text: `${filter.label}: ${filter.data.value}`,
        showarrow: false,
        x: 0.5,
        y: 1 + (index + 1) * aHeight * pxPercentage + 16 * pxPercentage,
        xref: 'paper',
        yref: 'paper',
        xanchor: 'center',
        yanchor: 'top',
        font: {
          family: layout.font?.family || 'Roboto, sans-serif',
          size,
          color: layout.font?.color || 'rgb(61, 82, 101)',
        },
      });
    });

    if (layout.title) {
      layout.title.automargin = false;
      layout.title.yref = 'container';
      layout.title.yanchor = 'top';
      layout.title.y = 1;
    }

    gd = await plotly.newPlot(
      '__plotly_download_container__',
      chartData.data,
      layout,
    );

    const base64 = await plotly.toImage(gd, {
      format: type,
      filename: title,
      width,
      height,
    });

    const link = document.createElement('a');
    link.href = base64;
    link.download = `${title}.${type.toLowerCase()}`;
    link.click();

    document.body.removeChild(container);
  };

  return (
    <Popup
      popper={{ id: 'vis-toolbar-popup', className: 'download-popup' }}
      position="bottom left"
      on="click"
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      onOpen={() => {
        setOpen(true);
      }}
      trigger={
        <div className="download">
          <button className={cx('trigger-button', { open })}>
            <i className="ri-download-fill" />
            <span>Download</span>
          </button>
        </div>
      }
      content={
        <>
          <div className="item">
            <span className="label">Data formats</span>
            <div className="types">
              <div className="type">
                <button
                  onClick={() => {
                    handleDownloadData();
                  }}
                >
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>
          <div className="item">
            <span className="label">Image formats</span>
            <div className="types">
              <div className="type">
                <button
                  onClick={() => {
                    handleDownloadImage('svg');
                  }}
                >
                  <span>SVG</span>
                </button>
              </div>
              <div className="type">
                <button
                  onClick={() => {
                    handleDownloadImage('png');
                  }}
                >
                  <span>PNG</span>
                </button>
              </div>
            </div>
          </div>
        </>
      }
    />
  );
}

const WithLibsDownload = injectLazyLibs(['reactChartEditorLib', 'plotlyLib'])(
  Download,
);
export default WithLibsDownload;
