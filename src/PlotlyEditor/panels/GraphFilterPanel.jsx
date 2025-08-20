import PropTypes from 'prop-types';
import { isArray, uniq } from 'lodash';

import PlotlyPanel from '@eeacms/react-chart-editor/lib/components/containers/PlotlyPanel';
import PlotlyFold from '@eeacms/react-chart-editor/lib/components/containers/PlotlyFold';
import Dropdown from '@eeacms/react-chart-editor/lib/components/widgets/Dropdown';
import TextInput from '@eeacms/react-chart-editor/lib/components/widgets/TextInput';
import Field from '@eeacms/react-chart-editor/lib/components/fields/Field';

// Containers
// Widgets
// Field

function getFilterOptions(rows) {
  if (!isArray(rows)) return [];
  return uniq(rows).map((value) => ({
    label: value,
    value,
  }));
}

const GraphFilterPanel = (_, context) => {
  const { dataSources, dataSourceOptions } = context;
  const { value, onChangeValue } = context.ctx;

  return (
    <PlotlyPanel
      addAction={{
        label: 'Filter',
        handler: () => {
          onChangeValue({
            ...value,
            filters: [...(value.filters || []), { label: '', field: null }],
          });
        },
      }}
      canReorder
    >
      <PlotlyFold name="Settings" canFold={false} canReorder={false}>
        <Field label="Variation">
          <Dropdown
            options={[
              { label: 'Filters on top', value: 'filters_on_top' },
              { label: 'Filters on right', value: 'filters_on_right' },
              { label: 'Filters on left', value: 'filters_on_left' },
            ]}
            value={value.variation}
            onChange={(variation) => {
              onChangeValue({
                ...value,
                variation,
              });
            }}
          />
        </Field>
      </PlotlyFold>
      {(value.filters || []).map((filter, index) => (
        <PlotlyFold
          key={index}
          value={value}
          onChangeValue={onChangeValue}
          index={index}
          name={`Filter ${index + 1}`}
          moveContainer={(direction) => {
            const filters = [...(value.filters || [])];
            if (direction === 'up' && index > 0) {
              [filters[index], filters[index - 1]] = [
                filters[index - 1],
                filters[index],
              ];
              onChangeValue({
                ...value,
                filters,
              });
            }
            if (direction === 'down' && index < filters.length - 1) {
              [filters[index], filters[index + 1]] = [
                filters[index + 1],
                filters[index],
              ];
              onChangeValue({
                ...value,
                filters,
              });
            }
          }}
          deleteContainer={() => {
            const { filters } = value;
            onChangeValue({
              ...value,
              filters: filters.filter((_, i) => i !== index),
            });
          }}
          canDelete
          canReorder
        >
          <Field label="Label">
            <TextInput
              editableClassName="width-100"
              value={filter.label}
              defaultValue=""
              onUpdate={() => {}}
              onChange={(label) => {
                onChangeValue({
                  ...value,
                  filters: value.filters.map((f, i) =>
                    i === index ? { ...f, label } : f,
                  ),
                });
              }}
            />
          </Field>
          <Field label="Target">
            <Dropdown
              options={dataSourceOptions}
              value={filter.field}
              onChange={(field) => {
                onChangeValue({
                  ...value,
                  filters: value.filters.map((f, i) =>
                    i === index ? { ...f, field } : f,
                  ),
                });
              }}
            />
          </Field>
          <Field label="Default value">
            <Dropdown
              options={getFilterOptions(dataSources[filter.field] || [])}
              value={filter.defaultValue}
              onChange={(defaultValue) => {
                onChangeValue({
                  ...value,
                  filters: value.filters.map((f, i) =>
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

GraphFilterPanel.contextTypes = {
  ctx: PropTypes.object,
  dataSources: PropTypes.object,
  dataSourceOptions: PropTypes.array,
};

export default GraphFilterPanel;
