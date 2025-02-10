import { cloneDeep } from 'lodash';
import { v4 as uuid } from 'uuid';

export function downloadDataURL(dataURL, filename) {
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

export const defaults = {
  axis: {
    title: {
      font: {
        size: 14,
      },
      standoff: 10,
    },
    autorange: true,
    automargin: true,
    mirror: false,
    showline: false,
    showgrid: true,
    zeroline: true,
    showticklabels: true,
    showspikes: false,
    gridwidth: 1,
    zerolinewidth: 1,
    linecolor: 'rgb(128, 130, 133)',
    gridcolor: 'rgb(230, 231, 232)',
    zerolinecolor: 'rgb(128, 130, 133)',
    ticks: '',
    tickmode: 'auto',
    tickangle: 'auto',
    ticklen: 10,
    tickwidth: 1,
    tickcolor: 'rgb(116, 118, 120)',
    ticklabelstandoff: 5,
    nticks: 0,
    rangeslider: {
      visible: false,
    },
    separatethousands: false,
    exponentformat: 'none',
  },
  annotation: {
    showarrow: false,
    xref: 'paper',
    yref: 'paper',
    x: 0,
    y: 1,
    yanchor: 'auto',
    xanchor: 'auto',
    align: 'center',
  },
};

export function applyPlotlyDefaults(value) {
  const v = value || {};
  return {
    ...v,
    chartData: {
      data: v.chartData?.data || [],
      layout: v.chartData?.layout || {
        font: {
          color: 'rgb(61, 82, 101)',
          family: 'Roboto, sans-serif',
          size: 14,
        },
        hoverlabel: {
          font: {
            size: 14,
          },
        },
        title: {
          font: {
            size: 20,
          },
          automargin: true,
          x: 0.5,
          y: 0.999,
          subtitle: {
            font: {
              size: 16,
            },
          },
        },
        margin: {
          l: 0,
          r: 0,
          b: 0,
          t: 0,
          pad: 0,
        },
        autosize: true,
        separators: '.,',
        hovermode: 'closest',
        clickmode: 'event',
        dragmode: false,
        plot_bgcolor: 'rgba(255, 255, 255, 0)',
        paper_bgcolor: 'rgba(255, 255, 255, 0)',
        showlegend: false,
        legend: {
          x: 0.5,
          y: -0.1,
          xanchor: 'center',
          yanchor: 'top',
          orientation: 'h',
          valign: 'middle',
          traceorder: 'normal',
          font: {
            size: 14,
          },
          title: {
            font: {
              size: 17,
            },
          },
        },
        colorway: [
          '#007B6C',
          '#50B0A4',
          '#A0E5DC',
          '#004B7F',
          '#008FF5',
          '#A0D7FF',
          '#FF9933',
          '#FDAF20',
          '#FDEC9B',
          '#DFD6E7',
          '#E7BC91',
        ],
        colorscale: {
          sequential: [
            [0, '#c8fff8'],
            [0.16666666666666666, '#a0e5dc'],
            [0.3333333333333333, '#78cac0'],
            [0.5, '#50b0a4'],
            [0.6666666666666666, '#289588'],
            [0.8333333333333334, '#007b6c'],
            [1, '#005248'],
          ],
          diverging: [
            [0, '#e56b38'],
            [0.07142857142857142, '#ff9933'],
            [0.14285714285714285, '#fdaf20'],
            [0.21428571428571427, '#fac50d'],
            [0.2857142857142857, '#fad936'],
            [0.35714285714285715, '#fbec9b'],
            [0.42857142857142855, '#fef6cd'],
            [0.5, '#f5e0d3'],
            [0.5714285714285714, '#c8fff8'],
            [0.6428571428571429, '#a0e5dc'],
            [0.7142857142857143, '#78cac0'],
            [0.7857142857142857, '#50b0a4'],
            [0.8571428571428571, '#289588'],
            [0.9285714285714286, '#007b6c'],
            [1, '#005248'],
          ],
          sequentialminus: [
            [0, '#c8fff8'],
            [0.16666666666666666, '#a0e5dc'],
            [0.3333333333333333, '#78cac0'],
            [0.5, '#50b0a4'],
            [0.6666666666666666, '#289588'],
            [0.8333333333333334, '#007b6c'],
            [1, '#005248'],
          ],
        },
        bargap: 0.33999999999999997,
        ...(v.chartData?.layout || {}),
        xaxis: cloneDeep(defaults.axis),
        yaxis: cloneDeep(defaults.axis),
      },
      frames: v.chartData?.frames || [],
    },
  };
}

export function getCssVariables(value) {
  return {
    '--y-axis-title-font-size':
      value?.layout?.yaxis?.title?.font?.size || value?.layout?.font?.size || 0,
  };
}

export function getDataSources(props) {
  return {
    ...(props.provider_data || {}),
    ...(props.data_source || {}),
  };
}

export function getFigureMetadata(block, metadata) {
  const { title, description } = metadata || {};
  const id = `figure-metadata-${block}`;
  const metadataEl = document.getElementById(id);
  if (metadataEl || (!title && !description)) return;

  const data = {
    blocks: {},
    blocks_layout: { items: [] },
  };

  function getBlock(type, plaintext) {
    const block = uuid();
    return [
      block,
      {
        '@type': 'slate',
        value: [
          {
            type,
            children: [
              {
                text: plaintext,
              },
            ],
          },
        ],
        plaintext,
      },
    ];
  }

  const blocks = [
    ...(title ? [getBlock('h4', `Figure 1. ${title}`)] : []),
    ...(description ? [getBlock('p', description)] : []),
  ];

  blocks.forEach((block) => {
    if (!block) return;
    data.blocks[block[0]] = block[1];
    data.blocks_layout.items.push(block[0]);
  });

  return {
    '@type': 'group',
    className: 'figure-metadata',
    id,
    data,
  };
}

export function downloadSVG(svgElement, fileName) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadSVGAsPNG(svgElement, fileName) {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const img = new Image();
  // Create a blob URL for the SVG string
  const svgBlob = new Blob([svgString], {
    type: 'image/svg+xml;charset=utf-8',
  });
  const url = URL.createObjectURL(svgBlob);
  // When the image is loaded, draw it on the canvas
  img.onload = function () {
    // Set canvas size to the SVG size
    canvas.width = parseInt(
      svgElement.viewBox.baseVal.width || svgElement?.width?.baseVal?.value,
    );
    canvas.height = parseInt(
      svgElement.viewBox.baseVal.width || svgElement?.width?.baseVal?.value,
    );
    context.drawImage(img, 0, 0);
    const pngData = canvas.toDataURL('image/png');
    // Create a download link for the PNG
    const link = document.createElement('a');
    link.href = pngData;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Revoke the blob URL to free memory
    URL.revokeObjectURL(url);
  };

  // Set the image source to the blob URL
  img.src = url;
}
