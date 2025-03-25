import React, { useEffect, useState, useRef } from 'react';
import loadable from '@loadable/component';
import { toast } from 'react-toastify';
import { Portal } from 'react-portal';
import {
  Modal,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
} from 'semantic-ui-react';
import { Toast } from '@plone/volto/components';
import {
  initEditor,
  destroyEditor,
  validateEditor,
} from '@eeacms/volto-plotlycharts/helpers/editor';

import 'jsoneditor/dist/jsoneditor.min.css';

const Button = loadable(() =>
  import('react-chart-editor/lib/components/widgets/Button'),
);

const JsonEditor = (props) => {
  const { initialValue: dflt, options, onClose, onChange } = props;
  const editor = useRef();
  const editorEl = useRef();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = editorEl.current;
    const e = editor.current;

    initEditor({
      el,
      editor,
      dflt,
      options: {
        onModeChange: () => {
          setReady(false);
          setTimeout(() => {
            setReady(true);
          }, 0);
        },
        ...options,
      },
      onInit: () => {
        setReady(true);
      },
    });

    return () => {
      setReady(false);
      destroyEditor(e);
    };
  }, [dflt, options]);

  async function getValue() {
    const valid = await validateEditor(editor);
    if (!valid) {
      throw new Error('Invalid JSON');
    }
    try {
      return editor.current.get();
    } catch {
      throw new Error('Invalid JSON');
    }
  }

  function importJson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const text = await file.text();
      try {
        const json = JSON.parse(text);
        editor.current.set(json);
        validateEditor(editor);
      } catch (error) {
        toast.error(
          <Toast error title={'JSON error'} content={error.message} />,
        );
      }
    };
    input.click();
  }

  async function exportJson() {
    if (!validateEditor(editor)) {
      return;
    }
    try {
      const element = document.createElement('a');
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' +
          encodeURIComponent(editor.current.getText()),
      );
      element.setAttribute('download', 'plotly.json');
      element.style.display = 'none';
      element.click();
    } catch (error) {
      toast.error(<Toast error title={'JSON error'} content={error.message} />);
    }
  }

  return (
    <Modal size="fullscreen" open={true} className="json-editor">
      <Modal.Content>
        <div ref={editorEl} style={{ width: '100%', height: '100%' }} />
        {ready && editorEl.current && (
          <Portal node={editorEl.current.querySelector('.jsoneditor-menu')}>
            <Dropdown
              className="jsoneditor-insert"
              as="button"
              style={{ opacity: 1, zIndex: 1 }}
            >
              <DropdownMenu>
                <DropdownItem
                  text="Tree editor"
                  onClick={() => {
                    editor.current.setMode('tree');
                  }}
                />
                <DropdownItem
                  text="Code editor"
                  onClick={() => {
                    editor.current.setMode('code');
                  }}
                />
                <DropdownDivider />
                <DropdownItem text="Import json" onClick={importJson} />
                <DropdownItem text="Export json" onClick={exportJson} />
              </DropdownMenu>
            </Dropdown>
          </Portal>
        )}
      </Modal.Content>
      <Modal.Actions
        className="editor_controls plotly-editor--theme-provider"
        style={{ width: '100%', justifyContent: 'end' }}
      >
        <Button
          variant="secondary"
          label="close"
          onClick={() => {
            onClose();
          }}
        />
        <Button
          variant="primary"
          label="apply"
          onClick={async () => {
            try {
              const value = await getValue();
              onChange(value);
              onClose();
            } catch (error) {
              toast.error(
                <Toast error title={'JSON error'} content={error.message} />,
              );
            }
          }}
        />
      </Modal.Actions>
    </Modal>
  );
};

export default JsonEditor;
