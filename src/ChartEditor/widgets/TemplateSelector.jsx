import { useEffect, useState } from 'react';
import { omit, sortBy } from 'lodash';
import { renderTraceIcon } from 'react-chart-editor';
import { Api } from '@plone/volto/helpers';

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
  const { onUpdateValue, dataSourceOptions } = props;
  const [groupedTemplates, setGroupedTemplates] = useState({});

  useEffect(() => {
    const api = new Api();
    api.get('/@plotly_templates').then((res) => {
      const data = {};
      res.templates.forEach((template, index) => {
        const type = template.type?.value || 'unknown';
        if (!data[type]) {
          data[type] = [];
        }
        data[type].push({
          ...template,
          index,
        });
      });
      Object.keys(data).forEach((key) => {
        data[key] = sortBy(data[key], ['label', 'index']);
      });
      setGroupedTemplates(data);
    });
  }, []);

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
                        onUpdateValue({
                          ...omit(template.visualization || {}, [
                            ...(dataSourceOptions.length > 0
                              ? ['data_source']
                              : []),
                          ]),
                        });
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

export default TemplateSelector;
