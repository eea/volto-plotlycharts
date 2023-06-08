import Field from 'react-chart-editor/lib/components/fields/Field';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connectToContainer } from 'react-chart-editor/lib';

import ColorscalePickerWidget from '../widgets/ColorscalePicker';

const EDITOR_ACTIONS = {
  UPDATE_TRACES: 'plotly-editor-update-traces',
  ADD_TRACE: 'plotly-editor-add-trace',
  DELETE_TRACE: 'plotly-editor-delete-trace',
  UPDATE_LAYOUT: 'plotly-editor-update-layout',
  DELETE_ANNOTATION: 'plotly-editor-delete-annotation',
  DELETE_SHAPE: 'plotly-editor-delete-shape',
  DELETE_IMAGE: 'plotly-editor-delete-image',
  DELETE_RANGESELECTOR: 'plotly-editor-delete-rangeselector',
  DELETE_TRANSFORM: 'plotly-editor-delete-transform',
  MOVE_TO: 'plotly-editor-move-to',
};

export class UnconnectedColorscalePicker extends Component {
  constructor() {
    super();
    this.onUpdate = this.onUpdate.bind(this);
  }

  onUpdate(colorscale, colorscaleType) {
    if (Array.isArray(colorscale)) {
      this.props.updatePlot(
        colorscale.map((c, i) => {
          let step = i / (colorscale.length - 1);
          if (i === 0) {
            step = 0;
          }
          return [step, c];
        }),
        colorscaleType,
      );
      this.context.onUpdate({
        type: EDITOR_ACTIONS.UPDATE_TRACES,
        payload: {
          update: { autocolorscale: false },
          traceIndexes: [this.props.fullContainer.index],
        },
      });
    }
  }

  render() {
    const { fullValue } = this.props;
    const colorscale = Array.isArray(fullValue)
      ? fullValue.map((v) => v[1])
      : null;

    return (
      <Field {...this.props} fieldContainerClassName="field__colorscale">
        <ColorscalePickerWidget
          selected={colorscale}
          onColorscaleChange={this.onUpdate}
          initialCategory={this.props.initialCategory}
          disableCategorySwitch={this.props.disableCategorySwitch}
          editable={this.props.editable}
        />
      </Field>
    );
  }
}

UnconnectedColorscalePicker.propTypes = {
  labelWidth: PropTypes.number,
  fullValue: PropTypes.any,
  fullContainer: PropTypes.object,
  updatePlot: PropTypes.func,
  initialCategory: PropTypes.string,
  ...Field.propTypes,
};

UnconnectedColorscalePicker.contextTypes = {
  container: PropTypes.object,
  graphDiv: PropTypes.object,
  onUpdate: PropTypes.func,
};

UnconnectedColorscalePicker.displayName = 'UnconnectedColorscalePicker';

export default connectToContainer(UnconnectedColorscalePicker);
