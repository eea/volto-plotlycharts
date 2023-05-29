import ColorscalePickerWidget from '../widgets/ColorscalePicker';
import Field from 'react-chart-editor/lib/components/fields/Field';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connectToContainer } from 'react-chart-editor/lib';

class UnconnectedColorwayPicker extends Component {
  render() {
    return (
      <Field {...this.props}>
        <ColorscalePickerWidget
          selected={this.props.fullValue}
          onColorscaleChange={this.props.updatePlot}
          initialCategory="categorical"
          disableCategorySwitch={this.props.disableCategorySwitch}
          attr={this.props.attr}
          handleChange={this.props.handleChange}
        />
      </Field>
    );
  }
}

UnconnectedColorwayPicker.propTypes = {
  fullValue: PropTypes.any,
  updatePlot: PropTypes.func,
  ...Field.propTypes,
};

UnconnectedColorwayPicker.displayName = 'UnconnectedColorwayPicker';

export default connectToContainer(UnconnectedColorwayPicker);
