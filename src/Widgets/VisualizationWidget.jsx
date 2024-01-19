import React, { useState, useEffect, useCallback } from 'react';
import { Button, Modal, Grid, Label } from 'semantic-ui-react';
import { map, mapKeys } from 'lodash';

import config from '@plone/volto/registry';
import { FormFieldWrapper } from '@plone/volto/components';
import { pickMetadata } from '@eeacms/volto-embed/helpers';

import PlotlyJsonModal from './PlotlyJsonModal';
import ConnectedChart from '../ConnectedChart';
import ChartEditor from '../ChartEditor';

import './style.less';

const PlotlyEditorModal = (props) => {
  const [value, setValue] = useState(props.value);
  const [showImportJSON, setShowImportJSON] = useState(false);

  const InternalUrlWidget = config.widgets.widget.internal_url;

  return (
    <>
      <Modal open={true} size="fullscreen" className="chart-editor-modal">
        <Modal.Content scrolling>
          <ChartEditor
            value={value}
            onChangeValue={(value) => {
              setValue(value);
            }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Grid>
            <Grid.Row>
              <Grid.Column computer={7} tablet={12} verticalAlign="middle">
                <InternalUrlWidget
                  title="Select data source"
                  id="provider-data"
                  onChange={(_, provider_url) => {
                    setValue((value) => ({
                      ...value,
                      provider_url,
                      use_data_sources: true,
                    }));
                  }}
                  value={value.provider_url}
                  showReload={true}
                />
              </Grid.Column>
              <Grid.Column
                computer={5}
                tablet={12}
                verticalAlign="middle"
                style={{
                  display: 'inline-flex',
                  flexFlow: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Button floated="right" onClick={() => setShowImportJSON(true)}>
                  JSON
                </Button>
                <div style={{ display: 'flex' }}>
                  <Button floated="right" onClick={props.onClose}>
                    Close
                  </Button>
                  <Button
                    primary
                    floated="right"
                    onClick={() => {
                      props.onChange(props.id, value);
                      props.onClose();
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Actions>
      </Modal>
      {showImportJSON && (
        <PlotlyJsonModal
          value={value}
          onChange={setValue}
          onClose={() => setShowImportJSON(false)}
        />
      )}
    </>
  );
};

const VisualizationWidget = (props) => {
  const { id, title, description, error, value, onChange } = props;
  const [showChartEditor, setShowChartEditor] = useState(false);

  // This is the structure of value
  // value = {
  //   chartData: {
  //     data: data || [],
  //     layout: layout || {},
  //     frames: frames || [],
  //   }
  //   provider_url: provider_url
  //   json_data: json_data
  //   use_data_sources: use_data_sources
  // }

  const handleJupyterChSetContent = useCallback(
    (event) => {
      if (event.data.type === 'jupyter-ch:setContent') {
        console.log('HERE', event.data);
        mapKeys(event.data.content, (contentValue, key) => {
          if (key === id) {
            onChange(id, {
              ...(value || {}),
              chartData: {
                ...(value?.chartData || {}),
                ...(contentValue?.chartData || {}),
              },
            });
          } else {
            onChange(key, contentValue);
          }
        });
      }
    },
    [id, value, onChange],
  );

  useEffect(() => {
    window.parent.postMessage(
      {
        type: 'jupyter-ch:getContent',
      },
      '*',
    );
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleJupyterChSetContent);
    return () => {
      window.removeEventListener('message', handleJupyterChSetContent);
    };
  }, [handleJupyterChSetContent]);

  if (__SERVER__) return '';

  return (
    <FormFieldWrapper {...props} columns={1}>
      <div className="wrapper">
        <label htmlFor={`field-${id}`}>{title}</label>
        <Button
          floated="right"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowChartEditor(true);
          }}
        >
          Open Chart Editor
        </Button>
      </div>
      {description && <p className="help">{description}</p>}
      <ConnectedChart
        data={{
          with_sources: false,
          with_notes: false,
          with_more_info: false,
          download_button: false,
          with_enlarge: false,
          with_share: false,
          visualization: {
            ...(value || {}),
            ...pickMetadata(props.formData || {}),
          },
        }}
      />
      {showChartEditor && (
        <PlotlyEditorModal
          {...props}
          value={value}
          onClose={() => setShowChartEditor(false)}
        />
      )}
      {map(error, (message) => (
        <Label key={message} basic color="red" pointing>
          {message}
        </Label>
      ))}
    </FormFieldWrapper>
  );
};

export default VisualizationWidget;
