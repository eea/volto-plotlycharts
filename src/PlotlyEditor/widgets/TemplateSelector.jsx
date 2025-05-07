import PropTypes from 'prop-types';
import { omit, sortBy } from 'lodash';
import { renderTraceIcon } from '@eeacms/react-chart-editor';

function Template(props) {
  const { type, label, onSelect } = props;

  const ComplexIcon = renderTraceIcon(type.icon || type.value, 'TraceType');

  return (
    <div
      role="button"
      tabIndex={0}
      className="template-item"
      onClick={onSelect}
      onKeyDown={() => {}}
    >
      <div className="template-item__image">
        <div className="template-item__image__wrapper">
          <ComplexIcon />
        </div>
      </div>
      <div className="template-item__label">{label}</div>
    </div>
  );
}

function TemplateSelector(props) {
  const {
    groupedTemplates,
    value,
    dataSources,
    loadDataSources,
    onChangeValue,
  } = props;

  return (
    <div className="template-selector plotly-editor--theme-provider">
      <div className="template-selector__list">
        <div className="template-selector__list--wrapper">
          {sortBy(Object.entries(groupedTemplates), ([t, templates]) => {
            return templates[0].type?.order || Infinity;
          }).map(([_, templates]) => {
            const type = templates[0].type || {
              label: 'Unknown',
              value: 'unknown',
              icon: 'animation',
            };
            return (
              <div className="template-group" key={type.value}>
                <p className="template-group__label">{type.label}</p>
                <div className="template-group__list">
                  {templates.map((template) => (
                    <Template
                      key={`${type}-${template.index}`}
                      {...props}
                      type={type}
                      label={template.label || `Template ${template.index + 1}`}
                      onSelect={() => {
                        const tmpl = template.visualization || {};

                        const ds = {
                          ...(dataSources || {}),
                          ...(tmpl.dataSources || {}),
                        };

                        const columnsMap = new Map();

                        [
                          ...(value.columns || []),
                          ...(tmpl.columns || []),
                        ].forEach((col) => {
                          columnsMap.set(col.key, col);
                        });

                        const columns = Array.from(columnsMap.values());

                        onChangeValue({
                          ...value,
                          ...omit(tmpl, ['dataSources']),
                          dataSources: ds,
                          columns,
                        });

                        loadDataSources?.(ds, columns);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

TemplateSelector.contextTypes = {
  ctx: PropTypes.object,
};

export default TemplateSelector;
