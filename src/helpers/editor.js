import { isString } from 'lodash';
import { toast } from 'react-toastify';
import { Toast } from '@plone/volto/components';

const jsoneditor = __CLIENT__ && require('jsoneditor');

export function initEditor({ el, editor, dflt, options, onInit }) {
  if (!jsoneditor) return;
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
