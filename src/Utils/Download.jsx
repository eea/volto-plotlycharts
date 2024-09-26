import React from 'react';
import cx from 'classnames';
import { Popup } from 'semantic-ui-react';
import {
  convertMatrixToCSV,
  convertToCSV,
  exportCSVFile,
  spreadCoreMetadata,
} from '@eeacms/volto-plotlycharts/helpers/csvString';
import {
  downloadSVGAsPNG,
  downloadSVG,
} from '@eeacms/volto-plotlycharts/helpers';

export default function Download(props) {
  const {
    title,
    provider_data,
    provider_metadata,
    providers_data,
    providers_metadata,
    core_metadata,
    url_source,
    chartRef,
    filters,
  } = props;
  const [open, setOpen] = React.useState(false);

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
      download_source_csv +
      publisher_csv +
      other_organisation_csv +
      data_provenance_csv +
      geo_coverage_csv +
      temporal_coverage_csv +
      data_csv;
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

  const handleDownloadImage = (type) => {
    const allSvgs = chartRef.current.querySelectorAll('svg');

    if (allSvgs.length > 0) {
      const combinedSvg = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
      );

      let maxWidth = 0;
      let totalHeight = 0;
      const textHeight = 16;
      const paddingBetweenText = 10;
      const startDistance = 30;
      let totalTextHeight = 0;

      const textSvg = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
      );

      if (filters.length > 0) {
        totalTextHeight =
          startDistance + filters.length * (textHeight + paddingBetweenText);
      }

      textSvg.setAttribute('width', '100%');
      textSvg.setAttribute('height', totalTextHeight);

      filters.forEach((filter, filterIndex) => {
        const textElement = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text',
        );

        textElement.setAttribute('x', '50%');
        textElement.setAttribute(
          'y',
          startDistance +
            paddingBetweenText +
            filterIndex * (textHeight + paddingBetweenText) +
            textHeight / 2,
        );
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('dominant-baseline', 'middle');
        textElement.setAttribute('fill', 'black'); // Ensure text is black
        textElement.setAttribute('font-size', '16');
        textElement.setAttribute('font-family', 'sans-serif');
        textElement.textContent = `${filter.label}: ${filter.data.label}`;

        textSvg.appendChild(textElement);
      });

      combinedSvg.appendChild(textSvg);

      const shiftY = 10 * filters.length;
      allSvgs.forEach((svg, index) => {
        const svgClone = svg.cloneNode(true);

        // Get width and height of the SVG
        const svgWidth = parseInt(
          svgClone.viewBox.baseVal.width || svgClone?.width?.baseVal?.value,
        );
        const svgHeight = parseInt(
          svgClone?.viewBox?.baseVal.height || svgClone?.height?.baseVal?.value,
        );

        // Make all elements inside SVG modify only x and width attributes (no scaling)
        const elements = svgClone.querySelectorAll('*');
        elements.forEach((el) => {
          ['x', 'width', 'cx'].forEach((attr) => {
            if (el.hasAttribute(attr)) {
              const originalValue = parseFloat(el.getAttribute(attr));
              el.setAttribute(attr, originalValue);
            }
          });

          if (index === 1 && el.tagName === 'text') {
            el.setAttribute('x', '50%');
            el.setAttribute('text-anchor', 'middle');
          }

          if (el.tagName === 'text') {
            el.setAttribute('fill', 'black');
            if (el.hasAttribute('style')) {
              const style = el.getAttribute('style');
              const newStyle = style.replace(/fill:[^;]+;/, 'fill:black;');
              el.setAttribute('style', newStyle);
            }
          }
        });

        svgClone.style.background = 'none';
        svgClone.setAttribute('style', 'background-color: transparent');

        if (svgWidth > maxWidth) maxWidth = svgWidth;

        const originalY = svgClone.getAttribute('y') || 0;
        const newY = parseInt(originalY) + shiftY;

        if (index !== 1) svgClone.setAttribute('y', newY + totalTextHeight);

        totalHeight += svgHeight;

        combinedSvg.appendChild(svgClone);
      });

      // Adjust the final combined SVG size based on the original dimensions
      const forcedWidth = 700;
      const aspectRatio = maxWidth / totalHeight;
      const forcedHeight = forcedWidth / aspectRatio;

      combinedSvg.setAttribute('width', forcedWidth);
      combinedSvg.setAttribute('height', forcedHeight + totalTextHeight);

      combinedSvg.setAttribute(
        'viewBox',
        `0 0 ${maxWidth} ${totalHeight + totalTextHeight}`,
      );

      if (type === 'svg') {
        downloadSVG(combinedSvg, `${title}.${type.toLowerCase()}`);
      } else if (type === 'png') {
        downloadSVGAsPNG(combinedSvg, `${title}.${type.toLowerCase()}`);
      }
    }
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
                    if (provider_data && !providers_data) {
                      handleDownloadData();
                    } else if (providers_data) {
                      handleDownloadMultipleData();
                    }
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
