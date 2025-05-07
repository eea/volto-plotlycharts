import React, { useEffect, useState } from 'react';
import { map } from 'lodash';
import cx from 'classnames';
import { Button, Modal, Label } from 'semantic-ui-react';

import { FormFieldWrapper } from '@plone/volto/components';

import { pickMetadata } from '@eeacms/volto-embed/helpers';

import PlotlyComponent from '@eeacms/volto-plotlycharts/PlotlyComponent';
import PlotlyEditor from '@eeacms/volto-plotlycharts/PlotlyEditor';

const PlotlyEditorModal = (props) => {
  const [fadeInOut, setFadeInOut] = useState(true);

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
    <Modal
      open={true}
      size="fullscreen"
      className={cx('chart-editor-modal', { 'fade-in-out': fadeInOut })}
    >
      <Modal.Content scrolling={false}>
        <PlotlyEditor
          initialValue={props.value}
          onApply={(value) => {
            props.onChange(props.id, value);
            onClose();
          }}
          onClose={onClose}
        />
      </Modal.Content>
    </Modal>
  );
};

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
      <PlotlyComponent
        {...props}
        data={{
          with_sources: false,
          with_notes: false,
          with_more_info: false,
          download_button: false,
          with_enlarge: false,
          with_share: false,
          properties: pickMetadata(props.formData || {}),
          visualization: props.value,
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
