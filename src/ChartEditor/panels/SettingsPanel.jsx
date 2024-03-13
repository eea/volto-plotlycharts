import { Checkbox } from 'semantic-ui-react';
import PlotlyPanel from 'react-chart-editor/lib/components/containers/PlotlyPanel';
import PlotlyFold from 'react-chart-editor/lib/components/containers/PlotlyFold';

const SettingsPanel = (props, { localize: _ }) => {
  return (
    <PlotlyPanel {...props} style={{ height: '100%' }}>
      <PlotlyFold name="Defaults">
        <div style={{ padding: '1rem' }}>
          <Checkbox
            label="Use data sources"
            checked={props.value.use_data_sources}
            onChange={(_, data) => {
              props.onChangeValue({
                ...props.value,
                use_data_sources: data.checked,
              });
            }}
            toggle
          />
        </div>
      </PlotlyFold>
    </PlotlyPanel>
  );
};

export default SettingsPanel;
