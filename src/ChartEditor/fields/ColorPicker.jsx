/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/anchor-is-valid */
import Field from 'react-chart-editor/lib/components/fields/Field';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connectToContainer } from 'react-chart-editor/lib';

import ColorPickerWidget from '../widgets/ColorPicker';

export class UnconnectedColorPicker extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      empty: !this.props.fullValue && this.props.handleEmpty,
    };
  }

  render() {
    if (this.state.empty) {
      return (
        <Field {...this.props}>
          <div className="js-test-info">
            This color is computed from other parts of the figure but you can{' '}
            <a
              onClick={() => {
                this.setState({ empty: false });
                this.props.updatePlot(this.props.defaultColor);
              }}
            >
              override it
            </a>
            .
          </div>
        </Field>
      );
    }

    return (
      <Field {...this.props}>
        <ColorPickerWidget
          selectedColor={this.props.fullValue}
          onColorChange={this.props.updatePlot}
        />
      </Field>
    );
  }
}

UnconnectedColorPicker.propTypes = {
  fullValue: PropTypes.any,
  updatePlot: PropTypes.func,
  handleEmpty: PropTypes.bool,
  defaultColor: PropTypes.string,
  ...Field.propTypes,
};

UnconnectedColorPicker.displayName = 'UnconnectedColorPicker';

export default connectToContainer(UnconnectedColorPicker);