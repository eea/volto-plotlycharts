import { injectLazyLibs } from '@plone/volto/helpers/Loadable/Loadable';
import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { sortBy, omit } from 'lodash';
import cx from 'classnames';
import loadable from '@loadable/component';
import { Modal, Popup, Menu } from 'semantic-ui-react';
import { PlusIcon } from 'plotly-icons';

import PlotlyEditor from '@eeacms/volto-plotlycharts/PlotlyEditor';

const PlotlyButton = loadable(
  () => import('@eeacms/react-chart-editor/lib/components/widgets/Button'),
);
const plotlyUtils = loadable.lib(
  () => import('@eeacms/volto-plotlycharts/helpers/plotly'),
);

// const renderTraceIcon = __CLIENT__
//   ? require('@eeacms/react-chart-editor').renderTraceIcon
//   : () => null;

const EditTemplate = (props) => {
  const [fadeInOut, setFadeInOut] = useState(true);

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
    <Modal
      open={true}
      size="fullscreen"
      className={cx('chart-editor-modal', { 'fade-in-out': fadeInOut })}
    >
      <Modal.Content scrolling>
        <PlotlyEditor
          value={props.value}
          themes={props.themes}
          onApply={(value) => {
            props.onChange(value);
            onClose();
          }}
          onClose={onClose}
          isTemplate
        />
      </Modal.Content>
    </Modal>
  );
};

const Template = ({
  type,
  label,
  onEdit,
  onDelete,
  onClone,
  reactChartEditor,
}) => {
  const { renderTraceIcon } = reactChartEditor;
  const [open, setOpen] = useState(false);
  const ComplexIcon = useMemo(
    () => renderTraceIcon(type.icon || type.value, 'TraceType'),
    [type, renderTraceIcon],
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
      <Popup
        on="click"
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        position="bottom left"
        className="template-item__popup"
        pinned
        flowing
        hoverable
        trigger={
          <button
            className={cx('button--context', { active: open })}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            ...
          </button>
        }
        content={
          <Menu vertical>
            <Menu.Item
              onClick={(e) => {
                onDelete();
                setOpen(false);
                e.stopPropagation();
              }}
            >
              Delete
            </Menu.Item>
            <Menu.Item
              onClick={(e) => {
                onClone();
                setOpen(false);
                e.stopPropagation();
              }}
            >
              Clone
            </Menu.Item>
          </Menu>
        }
      />
    </div>
  );
};

const TemplatesWidget = (props, { formData }) => {
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
                    data: [],
                    layout: {
                      template: formData.themes[0],
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
                          onClone={() => {
                            const newValue = [
                              ...value,
                              {
                                ...template,
                                label: `${template.label} (clone)`,
                              },
                            ];
                            onChange(id, newValue);
                            setSelectedTemplate(newValue.length - 1);
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

TemplatesWidget.contextTypes = {
  formData: PropTypes.object,
};

export default injectLazyLibs(['reactChartEditor'])(TemplatesWidget);
