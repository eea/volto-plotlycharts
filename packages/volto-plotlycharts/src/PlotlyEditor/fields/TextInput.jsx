import React from 'react';
import PropTypes from 'prop-types';
import { connectToContainer } from '@eeacms/react-chart-editor/lib';
import Field from '@eeacms/react-chart-editor/lib/components/fields/Field';
import TextInput from '@eeacms/react-chart-editor/lib/components/widgets/TextInput';

export const UnconnectedTextInput = (props) => {
  const { updatePlot, container } = props;
  const { customLink } = container;

  const handleChange = (value) => {
    updatePlot(value);
  };

  return (
    <Field {...props}>
      <TextInput
        onUpdate={handleChange}
        value={customLink}
        editableClassName="width-100"
      />
    </Field>
  );
};

UnconnectedTextInput.propTypes = {
  container: PropTypes.object.isRequired,
  updatePlot: PropTypes.func.isRequired,
};
UnconnectedTextInput.displayName = 'UnconnectedTextInput';

export default connectToContainer(UnconnectedTextInput);
