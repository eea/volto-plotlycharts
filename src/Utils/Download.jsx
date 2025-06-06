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

  const handleDownloadData = () => {
    let array = [];
    let data_provenance_array = [];
    let other_organisation_array = [];
    let temporal_coverage_array = [];
    let geo_coverage_array = [];
    let publisher_array = [];

    let readme = provider_metadata?.readme ? [provider_metadata?.readme] : [];

    Object.entries(dataSources).forEach(([key, items]) => {
      items.forEach((item, index) => {
        if (!array[index]) array[index] = {};
        array[index][key] = item;
      });
    });

    const hasDataProvenance = core_metadata.data_provenance?.length > 0;
    const hasOtherOrganisation = core_metadata.other_organisations?.length > 0;
    const hasTemporalCoverage = core_metadata.temporal_coverage?.length > 0;
    const hasGeoCoverage = core_metadata.geo_coverage?.length > 0;
    const hasPublisher = core_metadata.publisher?.length > 0;

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
      [{ 'Downloaded from: ': url_source }],
      [],
      true,
    );

    const csv =
      download_source_csv +
      publisher_csv +
      other_organisation_csv +
      data_provenance_csv +
      geo_coverage_csv +
      temporal_coverage_csv +
      data_csv;
    exportCSVFile(csv, title);
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
