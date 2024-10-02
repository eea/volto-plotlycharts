import React from 'react';
import cx from 'classnames';
import { Popup } from 'semantic-ui-react';
import {
  convertToCSV,
  exportCSVFile,
  spreadCoreMetadata,
} from '@eeacms/volto-plotlycharts/helpers/csvString';
import {
  downloadSVGAsPNG,
  downloadSVG,
  getDataSources,
} from '@eeacms/volto-plotlycharts/helpers';
import { getProviderData } from '@eeacms/volto-plotlycharts/helpers/plotly';

export default function Download(props) {
  const {
    title,
    provider_data,
    provider_metadata,
    core_metadata,
    url_source,
    chart,
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

    const dataSources = getDataSources({
      provider_data,
      data_source:
        Object.keys(chart?.data_source || {}).length > 0
          ? chart?.data_source
          : getProviderData(chart)[1],
    });

    Object.entries(dataSources).forEach(([key, items]) => {
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

  const handleDownloadImage = (type) => {
    const chartClone = chartRef.current.cloneNode(true);
    const DEFAULT_FONT_FAMILY = 'Times New Roman';
    const DEFAULT_FONT_SIZE = 16;
    const DEFAULT_FILL_COLOR = 'black';
    const PADDING_BETWEEN_TEXT = 10;
    const TITLE_HEIGHT = 18;
    const START_DISTANCE = 30;

    // Function to replace transparent fill with white
    const replaceTransparentWithWhite = (svgElement) => {
      const allElements = svgElement.querySelectorAll('*');
      allElements.forEach((element) => {
        const styleAttr = element.getAttribute('style');
        if (styleAttr && styleAttr.includes('fill')) {
          const fillMatch = styleAttr.match(/fill:\s*([^;]+)/);
          if (
            fillMatch &&
            (fillMatch[1] === 'transparent' ||
              fillMatch[1] === 'rgba(0, 0, 0, 0)')
          ) {
            const updatedStyle = styleAttr
              .replace(/fill:\s*transparent/g, 'fill: white')
              .replace(/fill:\s*rgba\(0, 0, 0, 0\)/g, 'fill: white');
            element.setAttribute('style', updatedStyle);
          }
        }
      });
    };


    const adjustYPositionAndStyle = (textElement, newY) => {
      textElement.setAttribute('y', newY);
      const tspanElements = textElement.querySelectorAll('tspan');
      tspanElements.forEach((tspan) => {
        tspan.setAttribute('y', newY);
        tspan.setAttribute('font-family', DEFAULT_FONT_FAMILY);
        tspan.setAttribute('font-size', TITLE_HEIGHT);
        tspan.setAttribute('fill', DEFAULT_FILL_COLOR);
        let currentStyle = tspan.getAttribute('style') || '';

        const updatedStyle = currentStyle.includes('fill')
          ? currentStyle.replace(/fill:\s*[^;]+/, `fill: ${DEFAULT_FILL_COLOR}`)
          : `${currentStyle}; fill: ${DEFAULT_FILL_COLOR}`;


        tspan.setAttribute('style', updatedStyle);

      });
      const textElements = textElement.querySelectorAll('text');
      textElements.forEach((tspan) => {
        tspan.setAttribute('y', newY);
        tspan.setAttribute('font-family', DEFAULT_FONT_FAMILY);
        tspan.setAttribute('font-size', TITLE_HEIGHT);
        tspan.setAttribute('fill', DEFAULT_FILL_COLOR);
        let currentStyle = tspan.getAttribute('style') || '';


        const updatedStyle = currentStyle.includes('fill')
          ? currentStyle.replace(/fill:\s*[^;]+/, `fill: ${DEFAULT_FILL_COLOR}`)
          : `${currentStyle}; fill: ${DEFAULT_FILL_COLOR}`;


        tspan.setAttribute('style', updatedStyle);

      });
    };

    replaceTransparentWithWhite(chartClone);

    const allSvgs = chartClone.querySelectorAll('svg');
    let maxWidth = 0;
    let totalHeight = 0;
    let totalTextHeight = 0;

    const titleElement = allSvgs?.[1]?.querySelector('.g-gtitle');
    const totalTitileHeight = titleElement.children?.[0] ? chartRef.current.querySelector('.g-gtitle').getBBox().height : 0;


    if (allSvgs.length > 0) {
      const combinedSvg = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
      );

      if (filters.length > 0) {
        totalTextHeight =
          START_DISTANCE +
          filters.length * (DEFAULT_FONT_SIZE + PADDING_BETWEEN_TEXT) - PADDING_BETWEEN_TEXT;
      }

      // Loop through each SVG and adjust layout
      allSvgs.forEach((svg) => {
        const svgClone = svg.cloneNode(true);
        const svgWidth = parseInt(
          svgClone.viewBox.baseVal.width || svgClone?.width?.baseVal?.value,
          10,
        );
        const svgHeight = parseInt(
          svgClone?.viewBox?.baseVal.height || svgClone?.height?.baseVal?.value,
          10,
        );

        const gTitleElements = svgClone.querySelectorAll('.g-gtitle');
        gTitleElements.forEach((titleElement) =>
          titleElement.parentNode.removeChild(titleElement),
        );

        const originalY = svgClone.getAttribute('y') || 0;
        const newY = originalY +
          filters.length * (DEFAULT_FONT_SIZE + PADDING_BETWEEN_TEXT) + PADDING_BETWEEN_TEXT
        svgClone.setAttribute('y', newY);
        if (svgWidth > maxWidth) maxWidth = svgWidth;
        totalHeight = Math.max(svgHeight, totalHeight);

        combinedSvg.appendChild(svgClone);
      });

      // Add background rectangle to combined SVG
      const backgroundRect = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect',
      );
      backgroundRect.setAttribute('x', 0);
      backgroundRect.setAttribute('y', 0);
      backgroundRect.setAttribute('width', maxWidth);
      backgroundRect.setAttribute('height', totalHeight + totalTextHeight);
      backgroundRect.setAttribute('fill', 'white');
      combinedSvg.insertBefore(backgroundRect, combinedSvg.firstChild);

      combinedSvg.setAttribute('width', maxWidth);
      combinedSvg.setAttribute('height', totalHeight + totalTextHeight);
      combinedSvg.setAttribute(
        'viewBox',
        `0 0 ${maxWidth} ${totalHeight + totalTextHeight}`,
      );

      // Add extracted titles and filters
      const newTitleElement = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'g',
      );
      adjustYPositionAndStyle(titleElement, START_DISTANCE);
      newTitleElement.setAttribute('x', '50%');
      newTitleElement.setAttribute('y', START_DISTANCE);
      newTitleElement.setAttribute('text-anchor', 'middle');
      newTitleElement.setAttribute('dominant-baseline', 'middle');
      newTitleElement.appendChild(titleElement);
      combinedSvg.appendChild(newTitleElement);

      const textSvg = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
      );

      filters.forEach((filter, filterIndex) => {
        const textElement = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'text',
        );
        textElement.setAttribute('x', titleElement.children?.[0] ? titleElement.children?.[0].getAttribute('x') : '50%');
        textElement.setAttribute(
          'y',
          START_DISTANCE +
          totalTitileHeight + PADDING_BETWEEN_TEXT +
          filterIndex * (DEFAULT_FONT_SIZE + PADDING_BETWEEN_TEXT),
        );
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('dominant-baseline', 'middle');
        textElement.setAttribute('fill', DEFAULT_FILL_COLOR);
        textElement.setAttribute('font-size', `${DEFAULT_FONT_SIZE}`);
        textElement.setAttribute('font-family', 'sans-serif');
        textElement.textContent = `${filter.label}: ${filter.data.label}`;
        textSvg.appendChild(textElement);
      });
      textSvg.setAttribute('width', '100%');
      combinedSvg.appendChild(textSvg);

      // Trigger download of final SVG or PNG
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
