import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connectToContainer } from 'react-chart-editor/lib';
import Field from 'react-chart-editor/lib/components/fields/Field';

import { RadioBlocks } from '../widgets';

export class UnconnectedRadio extends Component {
  render() {
    return (
      <Field {...this.props}>
        <RadioBlocks
          options={this.props.options}
          activeOption={this.props.fullValue}
          onOptionChange={(...args) => {
            this.props.updatePlot(...args);
            if (this.props.onChange) {
              this.props.onChange(...args);
            }
          }}
        />
      </Field>
    );
  }
}

UnconnectedRadio.propTypes = {
  center: PropTypes.bool,
  fullValue: PropTypes.any,
  options: PropTypes.array.isRequired,
  updatePlot: PropTypes.func,
  onChange: PropTypes.func,
  ...Field.propTypes,
};

// for better appearance <Radio> overrides <Field> {center: false}
// default prop. This can be overridden manually using props for <Radio>.
UnconnectedRadio.defaultProps = {
  center: true,
};

UnconnectedRadio.displayName = 'UnconnectedRadio';

export default connectToContainer(UnconnectedRadio);
