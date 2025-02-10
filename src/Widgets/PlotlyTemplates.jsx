import { useMemo, useState } from 'react';
import { sortBy, omit, cloneDeep } from 'lodash';
import { Modal } from 'semantic-ui-react';
import { PlusIcon, GridIcon } from 'plotly-icons';
import loadable from '@loadable/component';

import {
  applyPlotlyDefaults,
  getCssVariables,
} from '@eeacms/volto-plotlycharts/helpers';

import PlotlyJsonModal from './PlotlyJsonModal';
import ChartEditor from '../ChartEditor';

const Button = loadable(() =>
  import('@eeacms/volto-plotlycharts/ChartEditor/widgets/Button'),
);

const renderTraceIcon = __CLIENT__
  ? require('react-chart-editor').renderTraceIcon
  : () => null;

const EditTemplate = (props) => {
  const [value, setValue] = useState(cloneDeep(props.value));
  const [showImportJSON, setShowImportJSON] = useState(false);

  return (
    <>
      <Modal
        open={true}
        size="fullscreen"
        className="chart-editor-modal editor_controls plotly-editor--theme-provider"
        style={{ ...getCssVariables(value.chartData) }}
      >
        <Modal.Content scrolling>
          <ChartEditor
            value={value}
            onChangeValue={(value) => {
              setValue(value);
            }}
            isTemplate
          />
        </Modal.Content>
        <Modal.Actions
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button
              variant="secondary"
              icon={<GridIcon />}
              onClick={() => setShowImportJSON(true)}
            >
              Data Source
            </Button>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button floated="right" onClick={props.onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                props.onChange(value);
                props.onClose();
              }}
            >
              Apply
            </Button>
          </div>
        </Modal.Actions>
      </Modal>
      {showImportJSON && (
        <PlotlyJsonModal
          value={value}
          onChange={setValue}
          onClose={() => setShowImportJSON(false)}
        />
      )}
    </>
  );
};

const Template = ({ type, visualization, label, onEdit, onDelete }) => {
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

const PlotlyTemplates = (props) => {
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

  return (
    <div className="editor_controls plotly-editor--theme-provider plotly-templates-widget">
      <div className="plotly-templates">
        <div className="plotly-templates--header">
          <Button
            variant="primary"
            icon={<PlusIcon />}
            onClick={(e) => {
              onChange(id, [
                ...value,
                { visualization: applyPlotlyDefaults() },
              ]);
              setSelectedTemplate(value.length);
              e.preventDefault();
            }}
          >
            template
          </Button>
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
                          key={`${type}-${template.index}`}
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
              label: value[selectedTemplate].label,
              type: value[selectedTemplate].type,
              ...(value[selectedTemplate].visualization || {}),
            }}
            onClose={() => setSelectedTemplate(-1)}
            onChange={(templateValue) => {
              const newValue = [...value];
              newValue[selectedTemplate] = {
                label: templateValue.label,
                type: templateValue.type,
                visualization: {
                  ...omit(templateValue, ['label', 'type']),
                },
              };
              onChange(id, newValue);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PlotlyTemplates;
