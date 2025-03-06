import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { sortBy, omit } from 'lodash';
import cx from 'classnames';
import loadable from '@loadable/component';
import { Modal } from 'semantic-ui-react';
import { PlusIcon } from 'plotly-icons';

import { sanitizeVisualization } from '@eeacms/volto-plotlycharts/hocs';
import PlotlyEditor from '@eeacms/volto-plotlycharts/PlotlyEditor';
import { JsonEditor } from '@eeacms/volto-plotlycharts/Utils';

const PlotlyButton = loadable(() =>
  import('react-chart-editor/lib/components/widgets/Button'),
);
const plotlyUtils = loadable.lib(() =>
  import('@eeacms/volto-plotlycharts/helpers/plotly'),
);

const renderTraceIcon = __CLIENT__
  ? require('react-chart-editor').renderTraceIcon
  : () => null;

const EditTemplate = sanitizeVisualization((props) => {
  const ctx = useRef();
  const { value, onChangeValue } = props;
  const [fadeInOut, setFadeInOut] = useState(true);
  const [showImportJSON, setShowImportJSON] = useState(false);

  function onClose() {
    setFadeInOut(true);
    setTimeout(() => {
      props.onClose();
    }, 300);
  }

  useEffect(() => {
    setFadeInOut(false);
  }, []);

  return (
    <>
      <Modal
        open={true}
        size="fullscreen"
        className={cx(
          'chart-editor-modal editor_controls plotly-editor--theme-provider',
          { 'fade-in-out': fadeInOut },
        )}
      >
        <Modal.Content scrolling>
          <PlotlyEditor
            ref={ctx}
            actions={[
              {
                variant: 'primary',
                onClick: () => setShowImportJSON(true),
                children: 'DEV',
              },
            ]}
            value={value}
            themes={props.themes}
            onChangeValue={onChangeValue}
            onApply={() => {
              props.onChange(value);
              onClose();
            }}
            onClose={onClose}
            isTemplate
          />
        </Modal.Content>
      </Modal>
      {showImportJSON && (
        <JsonEditor
          initialValue={{
            type: value.type,
            label: value.label,
            data: value.chartData.data,
            layout: value.chartData.layout,
            frames: value.chartData.frames,
          }}
          options={{
            mode: 'tree',
            schema: {
              type: 'object',
              properties: {
                type: {
                  type: 'object',
                },
                label: {
                  type: 'string',
                },
                data: {
                  type: 'array',
                },
                layout: {
                  type: 'object',
                },
                frames: {
                  type: 'array',
                },
              },
              required: ['type', 'label', 'data', 'layout'],
              additionalProperties: false,
            },
          }}
          onChange={async (newValue) => {
            const { getPlotlyDataSources } = await plotlyUtils.load();
            const [dataSources, update] = getPlotlyDataSources({
              data: newValue.data,
              layout: newValue.layout,
              originalDataSources: value.dataSources,
            });

            onChangeValue({
              type: newValue.type,
              label: newValue.label,
              chartData: omit(newValue, ['type', 'label']),
            });

            ctx.current.editor().loadDataSources(dataSources, update);
          }}
          onClose={() => setShowImportJSON(false)}
        />
      )}
    </>
  );
});

const Template = ({ type, label, onEdit, onDelete }) => {
  const ComplexIcon = useMemo(
    () => renderTraceIcon(type.icon || type.value, 'TraceType'),
    [type],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      className="template-item"
      onClick={onEdit}
      onKeyDown={() => {}}
    >
      <div className="template-item__image">
        <div className="template-item__image__wrapper">
          <ComplexIcon />
        </div>
      </div>
      <div className="template-item__label">{label}</div>
      <button
        className="button--delete"
        onClick={(e) => {
          onDelete();
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        x
      </button>
    </div>
  );
};

const PlotlyTemplates = (props, { formData }) => {
  const { id, value, onChange } = props;
  const [selectedTemplate, setSelectedTemplate] = useState(-1);

  const groupedTemplates = useMemo(() => {
    const data = {};
    value.forEach((template, index) => {
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
    return data;
  }, [value]);

  useEffect(() => {
    PlotlyButton.preload();
    PlotlyEditor.preload();
    plotlyUtils.preload();
  }, []);

  return (
    <div className="editor_controls plotly-editor--theme-provider plotly-templates-widget">
      <div className="plotly-templates">
        <div className="plotly-templates--header">
          <PlotlyButton
            variant="primary"
            icon={<PlusIcon />}
            onClick={(e) => {
              onChange(id, [
                ...value,
                {
                  type: { label: 'Scatter', order: 1, value: 'scatter' },
                  label: `Template ${value.length + 1}`,
                  visualization: {
                    chartData: {
                      data: [],
                      layout: {},
                      frames: [],
                    },
                  },
                },
              ]);
              setSelectedTemplate(value.length);
              e.preventDefault();
            }}
          >
            template
          </PlotlyButton>
        </div>
        <div className="plotly-templates__list">
          <div className="plotly-templates__list--wrapper">
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
                    {templates.map((template) => {
                      return (
                        <Template
                          key={`${type}-${template.label}-${template.index}`}
                          type={type}
                          visualization={template.visualization}
                          label={
                            template.label || `Template ${template.index + 1}`
                          }
                          onEdit={() => {
                            setSelectedTemplate(template.index);
                          }}
                          onDelete={() => {
                            const newValue = [...value];
                            newValue.splice(template.index, 1);
                            onChange(id, newValue);
                            setSelectedTemplate(-1);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {selectedTemplate >= 0 && (
          <EditTemplate
            value={{
              ...omit(value[selectedTemplate] || {}, ['visualization']),
              ...(value[selectedTemplate]?.visualization || {}),
              // TODO: clean this up
              chartData: {
                ...(value[selectedTemplate]?.visualization?.chartData || {}),
                layout: {
                  ...(value[selectedTemplate]?.visualization?.chartData
                    ?.layout || {}),
                  template:
                    formData.themes.find((theme) => {
                      return (
                        theme.id ===
                        value[selectedTemplate]?.visualization?.chartData
                          ?.layout?.template?.id
                      );
                    }) || formData.themes[0],
                },
              },
            }}
            themes={formData.themes}
            onClose={() => setSelectedTemplate(-1)}
            onChange={(newTemplate) => {
              const newValue = value.reduce((acc, template, index) => {
                if (index === selectedTemplate) {
                  acc.push({
                    type: newTemplate.type,
                    label: newTemplate.label,
                    visualization: omit(newTemplate, ['type', 'label']),
                  });
                } else {
                  acc.push(template);
                }
                return acc;
              }, []);
              onChange(id, newValue);
            }}
          />
        )}
      </div>
    </div>
  );
};

PlotlyTemplates.contextTypes = {
  formData: PropTypes.object,
};

export default PlotlyTemplates;
