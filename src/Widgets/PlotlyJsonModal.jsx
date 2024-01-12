import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Portal } from 'react-portal';
import {
  Button,
  Modal,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
} from 'semantic-ui-react';
import { Toast } from '@plone/volto/components';

import 'jsoneditor/dist/jsoneditor.min.css';

const initJsonEditor = async (editor, jsonData, onInit) => {
  const jsoneditor = await import('jsoneditor');
  const JSONEditor = jsoneditor.default;
  // create the editor
  const container = document.getElementById('jsoneditor');

  if (!container) {
    return;
  }

  container.innerHTML = '';

  const options = {
    mode: 'code',
    enableTransform: false,
    schema: {
      type: 'object',
      patternProperties: {
        '^.*$': { type: 'array' },
      },
    },
  };
  editor.current = new JSONEditor(container, options);
  // set initial json
  editor.current.set(
    jsonData || {
      example_col_1: ['Value 1', 'Value 2', 'Value 3', 'Value 4'],
      example_col_2: [5, 2, 6, 10],
    },
  );
  onInit();
};

const PlotlyJsonModal = (props) => {
  const { data_providers, updateChartData, onClose } = props;
  const editor = useRef(null);
  const initialJsonData = useRef(props.jsonData);
  const [init, setInit] = useState(false);

  useEffect(() => {
    const editorCurr = editor.current;
    initJsonEditor(editor, initialJsonData.current, () => {
      setInit(true);
    });

    return () => {
      setInit(false);
      if (editorCurr) {
        editorCurr.destroy();
      }
    };
  }, []);

  return (
    <Modal size="fullscreen" open={true}>
      <Modal.Header>Edit Plotly JSON</Modal.Header>
      <Modal.Content>
        <div id="jsoneditor" style={{ width: '100%', height: '400px' }} />
        {init && (
          <Portal node={document.querySelector('#jsoneditor .jsoneditor-menu')}>
            <Dropdown
              className="jsoneditor-insert"
              as="button"
              style={{ opacity: 1, zIndex: 1, float: 'right' }}
              direction="left"
            >
              <DropdownMenu>
                <DropdownItem
                  text="Import json"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.json';
                    input.onchange = async (e) => {
                      const file = e.target.files[0];
                      const text = await file.text();
                      try {
                        const json = JSON.parse(text);
                        editor.current.set(json);
                      } catch (error) {
                        toast.error(
                          <Toast
                            error
                            title={'JSON error'}
                            content={error.message}
                          />,
                        );
                      }
                    };
                    input.click();
                  }}
                />
                <DropdownItem
                  text="Export json"
                  onClick={async () => {
                    const err = await editor.current.validate();

                    if (err.length) {
                      toast.warn(
                        <Toast
                          error
                          title={'JSON validation'}
                          content={
                            'Please make sure all the fields are in the correct format'
                          }
                        />,
                      );
                      return;
                    }
                    try {
                      const element = document.createElement('a');
                      element.setAttribute(
                        'href',
                        'data:text/plain;charset=utf-8,' +
                          encodeURIComponent(editor.current.getText()),
                      );
                      element.setAttribute('download', 'data.json');
                      element.style.display = 'none';
                      element.click();
                    } catch (error) {
                      toast.error(
                        <Toast
                          error
                          title={'JSON error'}
                          content={error.message}
                        />,
                      );
                    }
                  }}
                />
                {Object.keys(data_providers.data).length > 0 && (
                  <DropdownDivider />
                )}
                {Object.keys(data_providers.data).map((provider) => (
                  <DropdownItem
                    key={provider}
                    text={
                      <>
                        Use provider:{' '}
                        <span
                          style={{
                            border: '1px solid red',
                            borderRadius: '4px',
                            padding: '2px 4px',
                            backgroundColor: 'rgba(255, 0, 0, 0.1)',
                          }}
                        >
                          {provider}
                        </span>
                      </>
                    }
                    onClick={() => {
                      editor.current.set(
                        data_providers.data[provider][
                          data_providers.tree[provider][0]
                        ],
                      );
                    }}
                  />
                ))}
              </DropdownMenu>
            </Dropdown>
          </Portal>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={onClose}>Close</Button>
        <Button
          primary
          content="Apply"
          onClick={async () => {
            const err = await editor.current.validate();

            if (err.length) {
              toast.warn(
                <Toast
                  error
                  title={'JSON validation'}
                  content={
                    'Please make sure all the fields are in the correct format'
                  }
                />,
              );
              return;
            }

            try {
              updateChartData(editor.current.get());
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

export default connect((state) => ({
  data_providers: state.data_providers,
}))(PlotlyJsonModal);
