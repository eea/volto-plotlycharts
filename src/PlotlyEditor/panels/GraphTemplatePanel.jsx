import { findIndex } from 'lodash';
import PropTypes from 'prop-types';
import PlotlyPanel from 'react-chart-editor/lib/components/containers/PlotlyPanel';
import PlotlyFold from 'react-chart-editor/lib/components/containers/PlotlyFold';
import { UnconnectedDropdown } from 'react-chart-editor/lib/components/fields/Dropdown';
import Field from 'react-chart-editor/lib/components/fields/Field';
import TextInput from 'react-chart-editor/lib/components/widgets/TextInput';

const GraphTemplatePanel = (props, context) => {
  const { localize: _, traceTypesConfig } = context;
  const traces = traceTypesConfig.traces(_);
  const { value, onChangeValue } = context.ctx;

  return (
    <PlotlyPanel {...props} style={{ height: '100%' }}>
      <PlotlyFold name="Template Settings">
        <UnconnectedDropdown
          label={_('Type')}
          fullValue={value.type?.value}
          options={traces}
          updatePlot={(type) => {
            const trIndex = findIndex(traces, { value: type });
            const tr = traces[trIndex];
            onChangeValue({
              ...value,
              type: {
                label: tr.label,
                value: tr.value,
                icon: tr.icon,
                order: trIndex + 1,
              },
            });
          }}
          clearable={false}
        />
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

GraphTemplatePanel.contextTypes = {
  ctx: PropTypes.object,
  localize: PropTypes.func,
  traceTypesConfig: PropTypes.object,
};

export default GraphTemplatePanel;
