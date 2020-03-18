import React, { Component } from 'react';
import { connectToContainer } from 'react-chart-editor';
import { Field } from 'react-chart-editor';
import { TextInput } from 'react-chart-editor';

export class UnconnectedHoverFormatString extends Component {
  render() {
    let fullValue = this.props.fullValue;
    let placeholder;
    if (this.props.multiValued) {
      placeholder = fullValue;
      fullValue = '';
    }

    return (
      <Field {...this.props}>
        <TextInput
          value={fullValue}
          defaultValue={this.props.defaultValue}
          placeholder={placeholder}
          onUpdate={this.props.updatePlot}
          onChange={this.props.onChange}
        />
      </Field>
    );
  }
}
UnconnectedHoverFormatString.displayName = 'UnconnectedHoverFormatString';

const HoverFormatString = connectToContainer(UnconnectedHoverFormatString);

export default HoverFormatString;
