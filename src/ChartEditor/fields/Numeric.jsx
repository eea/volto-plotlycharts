import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connectToContainer } from 'react-chart-editor/lib';
import Field from 'react-chart-editor/lib/components/fields/Field';
import NumericInput from 'react-chart-editor/lib/components/widgets/NumericInput';

export class UnconnectedNumeric extends Component {
  render() {
    let fullValue = this.props.fullValue;
    let placeholder;
    if (this.props.multiValued) {
      placeholder = fullValue;
      fullValue = '';
    }

    return (
      <Field {...this.props}>
        <NumericInput
          value={fullValue}
          defaultValue={this.props.defaultValue}
          placeholder={placeholder}
          step={this.props.step}
          stepmode={this.props.stepmode}
          min={this.props.min}
          max={this.props.max}
          onChange={(...args) => {
            this.props.updatePlot(...args);
            if (this.props.onChange) {
              this.props.onChange(...args);
            }
          }}
          onUpdate={(...args) => {
            this.props.updatePlot(...args);
            if (this.props.onUpdate) {
              this.props.onUpdate(...args);
            }
          }}
          showArrows={!this.props.hideArrows}
          showSlider={this.props.showSlider}
        />
      </Field>
    );
  }
}

UnconnectedNumeric.propTypes = {
  defaultValue: PropTypes.any,
  fullValue: PropTypes.any,
  min: PropTypes.number,
  max: PropTypes.number,
  multiValued: PropTypes.bool,
  hideArrows: PropTypes.bool,
  showSlider: PropTypes.bool,
  step: PropTypes.number,
  stepmode: PropTypes.string,
  updatePlot: PropTypes.func,
  onChange: PropTypes.func,
  onUpdate: PropTypes.func,
  ...Field.propTypes,
};

UnconnectedNumeric.displayName = 'UnconnectedNumeric';

export default connectToContainer(UnconnectedNumeric);
