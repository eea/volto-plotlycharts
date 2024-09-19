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
