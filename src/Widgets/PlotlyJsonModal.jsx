import React, {
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Portal } from 'react-portal';
import { isArray, isPlainObject } from 'lodash';
import {
  Button,
  Modal,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownDivider,
  Tab,
} from 'semantic-ui-react';
import { Toast } from '@plone/volto/components';
import {
  initEditor,
  destroyEditor,
  validateEditor,
  onPasteEditor,
} from '@eeacms/volto-plotlycharts/helpers/editor';
import { getProviderData } from '@eeacms/volto-plotlycharts/helpers/plotly';

import 'jsoneditor/dist/jsoneditor.min.css';

const getPaneStyle = (active) =>
  active
    ? {
        flexGrow: 1,
        display: 'flex',
        flexFlow: 'column',
        marginBottom: 0,
      }
    : {};

const TabPlotlyJSON = forwardRef(({ active, value, setValue }, ref) => {
  const editor = useRef();
  const initialChartData = useRef({
    data: value.chartData?.data || [],
    layout: value.chartData?.layout || { xaxis: {}, yaxis: {} },
    frames: value.chartData?.frames || [],
  });
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!editor.current) {
      return;
    }
    editor.current.set({
      data: value.chartData.data || [],
      layout: value.chartData.layout || {},
      frames: value.chartData.frames || [],
    });
  }, [value]);

  useEffect(() => {
    initEditor({
      el: 'jsoneditor-plotlyjson',
      editor,
      dflt: initialChartData.current,
      options: {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
              },
            },
            layout: {
              type: 'object',
            },
            frames: {
              type: 'array',
            },
          },
          required: ['data', 'layout'],
          additionalProperties: false,
        },
      },
      onInit: () => {
        setInit(true);
      },
    });

    const editorCurr = editor.current;

    return () => {
      destroyEditor(editorCurr);
    };
  }, []);

  useImperativeHandle(
    ref,
    () => {
      return {
        Editor: () => editor.current,
        getValue: async () => {
          const valid = await validateEditor(editor);
          if (!valid) {
            throw new Error('Invalid JSON');
          }
          try {
            return {
              chartData: editor.current.get(),
            };
          } catch {
            throw new Error('Invalid JSON');
          }
        },
      };
    },
    [],
  );

  function importJson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const text = await file.text();
      try {
        const json = JSON.parse(text);

        let chartData = {
          data: json.data || [],
          layout: json.layout || {},
          frames: json.frames || [],
        };

        const [error, data_source, chart] = getProviderData({ chartData });

        if (error) {
          toast.error(
            <Toast error title={'JSON error'} content={error.message} />,
          );
          return;
        }

        setValue({
          ...value,
          ...chart,
          data_source,
        });
        editor.current.set(chart);
      } catch (error) {
        toast.error(
          <Toast error title={'JSON error'} content={error.message} />,
        );
      }
    };
    input.click();
  }

  async function exportJson() {
    const err = await editor.current.validate();

    if (err.length) {
      toast.warn(
        <Toast
          error
          title={'JSON validation'}
          content={'Please make sure all the fields are in the correct format'}
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
      element.setAttribute('download', 'plotly.json');
      element.style.display = 'none';
      element.click();
    } catch (error) {
      toast.error(<Toast error title={'JSON error'} content={error.message} />);
    }
  }

  return (
    <Tab.Pane active={active} style={getPaneStyle(active)}>
      <div
        id="jsoneditor-plotlyjson"
        style={{ width: '100%', height: '100%' }}
        onPaste={(e) => {
          onPasteEditor(editor);
          const { data, layout, frames } = editor.current.get();
          const chartData = { data, layout, frames };

          const [error, data_source, chart] = getProviderData({ chartData });

          if (error) {
            toast.error(
              <Toast error title={'JSON error'} content={error.message} />,
            );
            return;
          }

          setValue({
            ...value,
            ...chart,
            data_source,
          });
          editor.current.set(chart);
        }}
      />
      {init && (
        <Portal
          node={document.querySelector(
            '#jsoneditor-plotlyjson .jsoneditor-menu',
          )}
        >
          <Dropdown
            className="jsoneditor-insert"
            as="button"
            style={{ opacity: 1, zIndex: 1, float: 'right' }}
            direction="left"
          >
            <DropdownMenu>
              <DropdownItem text="Import json" onClick={importJson} />
              <DropdownItem text="Export json" onClick={exportJson} />
            </DropdownMenu>
          </Dropdown>
        </Portal>
      )}
    </Tab.Pane>
  );
});

const TabDataSource = forwardRef((props, ref) => {
  const { active, data_providers, value, setValue } = props;
  const editor = useRef();
  const initialDataSource = useRef(props.value.data_source || {});
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!editor.current) {
      return;
    }
    editor.current.set(value.data_source || {});
  }, [value]);

  useEffect(() => {
    initEditor({
      el: 'jsoneditor-datasource',
      editor,
      dflt: initialDataSource.current,
      options: {
        schema: {
          type: 'object',
          patternProperties: {
            '^.*$': { type: 'array' },
          },
        },
      },
      onInit: () => {
        setInit(true);
      },
    });

    const editorCurr = editor.current;

    return () => {
      destroyEditor(editorCurr);
    };
  }, []);

  useImperativeHandle(
    ref,
    () => {
      return {
        Editor: () => editor.current,
        getValue: async () => {
          const valid = await validateEditor(editor);
          if (!valid) {
            throw new Error('Invalid JSON');
          }
          try {
            return {
              data_source: editor.current.get(),
            };
          } catch {
            throw new Error('Invalid JSON');
          }
        },
      };
    },
    [],
  );

  function importJson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const text = await file.text();
      try {
        const json = JSON.parse(text);
        const data = {};

        if (isPlainObject(json)) {
          Object.keys(json).forEach((key) => {
            if (isArray(json[key])) {
              data[key] = json[key];
            }
          });
        }

        editor.current.set(data);
      } catch (error) {
        toast.error(
          <Toast error title={'JSON error'} content={error.message} />,
        );
      }
    };
    input.click();
  }

  async function exportJson() {
    const err = await editor.current.validate();

    if (err.length) {
      toast.warn(
        <Toast
          error
          title={'JSON validation'}
          content={'Please make sure all the fields are in the correct format'}
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
      toast.error(<Toast error title={'JSON error'} content={error.message} />);
    }
  }

  return (
    <Tab.Pane active={active} style={getPaneStyle(active)}>
      <div
        id="jsoneditor-datasource"
        style={{ width: '100%', height: '100%' }}
        onPaste={(e) => {
          onPasteEditor(editor);
        }}
      />
      {init && (
        <Portal
          node={document.querySelector(
            '#jsoneditor-datasource .jsoneditor-menu',
          )}
        >
          <Dropdown
            className="jsoneditor-insert"
            as="button"
            style={{ opacity: 1, zIndex: 1, float: 'right' }}
            direction="left"
          >
            <DropdownMenu>
              <DropdownItem text="Import json" onClick={importJson} />
              <DropdownItem text="Export json" onClick={exportJson} />
              <DropdownDivider />
              <DropdownItem
                text="Use chart data"
                onClick={() => {
                  const [error, data_source, newValue] = getProviderData(value);

                  if (error) {
                    toast.warn(
                      <Toast
                        error
                        title={'JSON error'}
                        content={error.message}
                      />,
                    );
                    return;
                  }

                  setValue(newValue);
                  editor.current.set(data_source);
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
    </Tab.Pane>
  );
});

const PlotlyJsonModal = (props) => {
  const { onClose, onChange } = props;
  const initialValue = useRef(props.value);
  const tabPlotlyJson = useRef(null);
  const tabDataSource = useRef(null);
  const [value, setValue] = useState(props.value);
  const [activeIndex, setActiveIndex] = useState(0);
  const tabs = [tabPlotlyJson, tabDataSource];

  const panes = [
    {
      menuItem: 'Plotly JSON',
      pane: () => (
        <TabPlotlyJSON
          {...props}
          value={value}
          setValue={setValue}
          key={'plotly-json'}
          ref={tabPlotlyJson}
          active={activeIndex === 0}
        />
      ),
    },
    {
      menuItem: 'Data source',
      pane: () => (
        <TabDataSource
          {...props}
          value={value}
          setValue={setValue}
          key={'data-source'}
          ref={tabDataSource}
          active={activeIndex === 1}
        />
      ),
    },
  ];

  return (
    <Modal size="fullscreen" open={true} className="plotly-json-modal">
      <Modal.Content scrolling>
        <Tab
          style={{
            height: '100%',
            display: 'flex',
            flexFlow: 'column',
          }}
          menu={{ secondary: true, pointing: true }}
          panes={panes}
          activeIndex={activeIndex}
          onTabChange={async (_, data) => {
            try {
              const newValue = {
                ...value,
                ...(await tabs[activeIndex].current.getValue()),
              };
              setValue(newValue);
              setActiveIndex(data.activeIndex);
            } catch {}
          }}
          renderActiveOnly={false}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button
          onClick={() => {
            onChange(initialValue.current);
            onClose();
          }}
        >
          Close
        </Button>
        <Button
          primary
          content="Apply"
          onClick={async () => {
            try {
              const newValue = {
                ...value,
                ...(await tabs[activeIndex].current.getValue()),
              };
              onChange(newValue);
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
