import { isString } from 'lodash';
import { v4 as uuid } from 'uuid';
import { toast } from 'react-toastify';
import { Toast } from '@plone/volto/components';

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

export async function initEditor({ el, editor, dflt, options, onInit }) {
  const jsoneditor = await import('jsoneditor');
  const JSONEditor = jsoneditor.default;
  // create the editor
  const container = isString(el) ? document.getElementById(el) : el;

  if (!container) {
    return;
  }

  container.innerHTML = '';

  const _options = {
    mode: 'code',
    enableTransform: false,
    schema: {
      type: 'array',
      items: {
        type: 'object',
      },
    },
    ...options,
  };

  editor.current = new JSONEditor(container, _options);
  // set initial json
  editor.current.set(dflt);

  if (onInit) onInit();
}

export function destroyEditor(editor) {
  if (editor) {
    editor.destroy();
    editor = null;
  }
}

export async function validateEditor(editor) {
  const err = await editor.current.validate();

  if (err.length) {
    toast.warn(
      <Toast
        error
        title={'JSON validation'}
        content={'Please make sure all the fields are in the correct format'}
      />,
    );
    return false;
  }

  return true;
}

export function onPasteEditor(editor) {
  try {
    editor.current.repair();
    editor.current.format();
  } catch {}
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
