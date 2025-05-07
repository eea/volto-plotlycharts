import PropTypes from 'prop-types';
import PlotlyPanel from '@eeacms/react-chart-editor/lib/components/containers/PlotlyPanel';
import PlotlyFold from '@eeacms/react-chart-editor/lib/components/containers/PlotlyFold';
import Field from '@eeacms/react-chart-editor/lib/components/fields/Field';
import TextInput from '@eeacms/react-chart-editor/lib/components/widgets/TextInput';

const GraphThemePanel = (props, context) => {
  const { value, onChangeValue } = context.ctx;

  return (
    <PlotlyPanel {...props} style={{ height: '100%' }}>
      <PlotlyFold name="Theme Settings">
        <Field label="Id">
          <TextInput
            editableClassName="width-100"
            value={value.id}
            defaultValue=""
            onUpdate={() => {}}
            onChange={(id) => {
              onChangeValue({
                ...value,
                id,
              });
            }}
          />
        </Field>
        <Field label="Label">
          <TextInput
            editableClassName="width-100"
            value={value.label}
            defaultValue=""
            onUpdate={() => {}}
            onChange={(label) => {
              onChangeValue({
                ...value,
                label,
              });
            }}
          />
        </Field>
      </PlotlyFold>
    </PlotlyPanel>
  );
};

GraphThemePanel.contextTypes = {
  ctx: PropTypes.object,
};

export default GraphThemePanel;
