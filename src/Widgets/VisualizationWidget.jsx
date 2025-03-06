import React, { useEffect, useState, useRef } from 'react';
import { map } from 'lodash';
import cx from 'classnames';
import loadable from '@loadable/component';
import { Button, Modal, Label } from 'semantic-ui-react';

import { FormFieldWrapper } from '@plone/volto/components';

import { pickMetadata } from '@eeacms/volto-embed/helpers';

import { sanitizeVisualization } from '@eeacms/volto-plotlycharts/hocs';

import ConnectedChart from '@eeacms/volto-plotlycharts/ConnectedChart';
import PlotlyEditor from '@eeacms/volto-plotlycharts/PlotlyEditor';
import { JsonEditor } from '@eeacms/volto-plotlycharts/Utils';

const plotlyUtils = loadable.lib(() =>
  import('@eeacms/volto-plotlycharts/helpers/plotly'),
);

const PlotlyEditorModal = sanitizeVisualization((props) => {
  const ctx = useRef();
  const { value, onChangeValue } = props;
  const [fadeInOut, setFadeInOut] = useState(true);
  const [showImportJSON, setShowImportJSON] = useState(false);

  function onClose() {
    setFadeInOut(true);
    setTimeout(() => {
      props.onClose();
    }, 300);
  }

  useEffect(() => {
    setFadeInOut(false);
  }, []);

  return (
    <>
      <Modal
        open={true}
        size="fullscreen"
        className={cx('chart-editor-modal plotly-editor--theme-provider', {
          'fade-in-out': fadeInOut,
        })}
      >
        <Modal.Content scrolling={false}>
          <PlotlyEditor
            ref={ctx}
            actions={[
              {
                variant: 'primary',
                onClick: () => setShowImportJSON(true),
                children: 'DEV',
              },
            ]}
            value={value}
            onChangeValue={onChangeValue}
            onApply={() => {
              props.onChange(props.id, value);
              onClose();
            }}
            onClose={onClose}
          />
        </Modal.Content>
      </Modal>
      {showImportJSON && value.chartData && (
        <JsonEditor
          initialValue={value.chartData}
          options={{
            mode: 'tree',
            schema: {
              type: 'object',
              properties: {
                data: {
                  type: 'array',
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
          }}
          onChange={async (newValue) => {
            const { getPlotlyDataSources } = await plotlyUtils.load();
            const [dataSources, update] = getPlotlyDataSources({
              data: newValue.data,
              layout: newValue.layout,
              originalDataSources: value.dataSources,
            });

            onChangeValue(newValue);

            ctx.current.editor().loadDataSources(dataSources, update);
          }}
          onClose={() => setShowImportJSON(false)}
        />
      )}
    </>
  );
});

const VisualizationWidget = (props) => {
  const { id, title, description, error } = props;
  const [showPlotlyEditor, setShowPlotlyEditor] = useState(false);

  useEffect(() => {
    PlotlyEditor.preload();
  }, []);

  return (
    <FormFieldWrapper {...props} columns={1}>
      <div className="wrapper">
        <label htmlFor={`field-${id}`}>{title}</label>
        <Button
          floated="right"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowPlotlyEditor(true);
          }}
        >
          Open Chart Editor
        </Button>
      </div>
      {description && <p className="help">{description}</p>}
      <ConnectedChart
        {...props}
        mode="edit"
        data={{
          with_sources: false,
          with_notes: false,
          with_more_info: false,
          download_button: false,
          with_enlarge: false,
          with_share: false,
          visualization: {
            ...(props.value || {}),
            ...pickMetadata(props.formData || {}),
          },
        }}
      />
      {showPlotlyEditor && (
        <PlotlyEditorModal
          {...props}
          value={props.value}
          onClose={() => setShowPlotlyEditor(false)}
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
