import React from 'react';
import cx from 'classnames';
import { cloneDeep } from 'lodash';
import loadable from '@loadable/component';
import { useLocation } from 'react-router-dom';
import { Popup } from 'semantic-ui-react';
import { toPublicURL } from '@plone/volto/helpers';
import {
  convertToCSV,
  exportCSVFile,
  exportZipFile,
  groupDataByDataset,
  processTraceData,
  spreadCoreMetadata,
} from '@eeacms/volto-plotlycharts/helpers/csvString';

const Plotly = loadable.lib(() => import('plotly.js/dist/plotly.min'));

export default function Download(props) {
  const location = useLocation();
  const { chartData, filters, provider_metadata } = props;

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

  const getMetadataFlags = () => ({
    hasDataProvenance: core_metadata.data_provenance?.length > 0,
    hasOtherOrganisation: core_metadata.other_organisations?.length > 0,
    hasTemporalCoverage: core_metadata.temporal_coverage?.length > 0,
    hasGeoCoverage: core_metadata.geo_coverage?.length > 0,
    hasPublisher: core_metadata.publisher?.length > 0,
  });

  const processMetadataArrays = (metadataFlags) => {
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

  const generateFinalCSV = (array, readme, metadataFlags, metadataArrays) => {
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
      await handleDownloadSingleCSV();
      return;
    }

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add individual CSV files for each dataset
      for (const [, datasetData] of Object.entries(datasets)) {
        const csvData = await generateCSVForDataset(datasetData);
        const fileName = `${datasetData.name || 'data'}.csv`;
        zip.file(fileName, csvData);
      }

      // Add the complete CSV with all data
      const completeCSVData = await generateOriginalCSV();
      zip.file(`${title}.csv`, completeCSVData);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipArrayBuffer = await zipBlob.arrayBuffer();
      exportZipFile(zipArrayBuffer, title);
    } catch (error) {
      await handleDownloadSingleCSV();
    }
  };

  const generateCSVForDataset = async (datasetData) => {
    let array = [];
    let readme = provider_metadata?.readme ? [provider_metadata?.readme] : [];

    // Collect all trace data separately
    const allTraceData = [];
    for (const trace of datasetData.data) {
      const traceData = await processTraceData(trace, dataSources);
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

    const metadataFlags = getMetadataFlags();
    const metadataArrays = processMetadataArrays(metadataFlags);
    return generateFinalCSV(array, readme, metadataFlags, metadataArrays);
  };

  const generateOriginalCSV = async () => {
    let array = [];
    let readme = provider_metadata?.readme ? [provider_metadata?.readme] : [];

    // Check if dataSources has any data
    const hasDataSources =
      dataSources &&
      Object.keys(dataSources).some(
        (key) => Array.isArray(dataSources[key]) && dataSources[key].length > 0,
      );

    if (hasDataSources) {
      // Use existing dataSources logic
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
        const traceData = await processTraceData(trace, dataSources || {});
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

    const metadataFlags = getMetadataFlags();
    const metadataArrays = processMetadataArrays(metadataFlags);
    return generateFinalCSV(array, readme, metadataFlags, metadataArrays);
  };

  const handleDownloadSingleCSV = async () => {
    const csvData = await generateOriginalCSV();
    exportCSVFile(csvData, title);
  };

  const handleDownloadImage = async (type) => {
    const plotly = (await Plotly.load()).default;

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
    const width = 1000;
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
