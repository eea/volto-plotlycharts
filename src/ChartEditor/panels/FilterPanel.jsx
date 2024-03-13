import { isArray, uniq } from 'lodash';
// Containers
import PlotlyPanel from 'react-chart-editor/lib/components/containers/PlotlyPanel';
import PlotlyFold from '../containers/PlotlyFold';
// Widgets
import Dropdown from 'react-chart-editor/lib/components/widgets/Dropdown';
import TextInput from 'react-chart-editor/lib/components/widgets/TextInput';
// Field
import Field from 'react-chart-editor/lib/components/fields/Field';

function getFilterOptions(rows) {
  if (!isArray(rows)) return [];
  return uniq(rows).map((value) => ({
    label: value,
    value,
  }));
}

const FilterPanel = (props) => {
  return (
    <PlotlyPanel
      addAction={{
        label: 'Filter',
        handler: () => {
          props.onChangeValue({
            ...props.value,
            filters: [
              ...(props.value.filters || []),
              { label: '', field: null },
            ],
          });
        },
      }}
      canReorder
      {...props}
    >
      <PlotlyFold name="Settings" canFold={false} canReorder={false}>
        <Field label="Variation">
          <Dropdown
            options={[
              { label: 'Filters on top', value: 'filters_on_top' },
              { label: 'Filters on right', value: 'filters_on_right' },
              { label: 'Filters on left', value: 'filters_on_left' },
            ]}
            value={props.value.variation}
            onChange={(variation) => {
              props.onChangeValue({
                ...props.value,
                variation,
              });
            }}
          />
        </Field>
      </PlotlyFold>
      {(props.value.filters || []).map((filter, index) => (
        <PlotlyFold
          key={index}
          value={props.value}
          onChangeValue={props.onChangeValue}
          index={index}
          name={`Filter ${index + 1}`}
          moveContainer={(direction) => {
            const filters = [...(props.value.filters || [])];
            if (direction === 'up' && index > 0) {
              [filters[index], filters[index - 1]] = [
                filters[index - 1],
                filters[index],
              ];
              props.onChangeValue({
                ...props.value,
                filters,
              });
            }
            if (direction === 'down' && index < filters.length - 1) {
              [filters[index], filters[index + 1]] = [
                filters[index + 1],
                filters[index],
              ];
              props.onChangeValue({
                ...props.value,
                filters,
              });
            }
          }}
          deleteContainer={() => {
            const { filters } = props.value;
            props.onChangeValue({
              ...props.value,
              filters: filters.filter((_, i) => i !== index),
            });
          }}
          canDelete
          canReorder
        >
          <Field label="Label">
            <TextInput
              value={filter.label}
              defaultValue=""
              onUpdate={() => {}}
              onChange={(label) => {
                props.onChangeValue({
                  ...props.value,
                  filters: props.value.filters.map((f, i) =>
                    i === index ? { ...f, label } : f,
                  ),
                });
              }}
            />
          </Field>
          <Field label="Field">
            <Dropdown
              options={props.dataSourceOptions}
              value={filter.field}
              onChange={(field) => {
                props.onChangeValue({
                  ...props.value,
                  filters: props.value.filters.map((f, i) =>
                    i === index ? { ...f, field } : f,
                  ),
                });
              }}
            />
          </Field>
          <Field label="Default value">
            <Dropdown
              options={getFilterOptions(props.dataSources[filter.field] || [])}
              value={filter.defaultValue}
              onChange={(defaultValue) => {
                props.onChangeValue({
                  ...props.value,
                  filters: props.value.filters.map((f, i) =>
                    i === index ? { ...f, defaultValue } : f,
                  ),
                });
              }}
            />
          </Field>
        </PlotlyFold>
      ))}
    </PlotlyPanel>
  );
};

export default FilterPanel;
