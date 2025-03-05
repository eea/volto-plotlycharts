import { useEffect, useState } from 'react';
import { PlusIcon } from 'plotly-icons';
import loadable from '@loadable/component';

import { JsonEditor, ThemeIcon } from '@eeacms/volto-plotlycharts/Utils';

const PlotlyButton = loadable(() =>
  import('react-chart-editor/lib/components/widgets/Button'),
);

const Theme = ({ label, onEdit, onDelete }) => {
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
          <ThemeIcon />
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

const PlotlyThemes = (props) => {
  const { id, value, onChange } = props;
  const [selectedTheme, setSelectedTheme] = useState(-1);

  useEffect(() => {
    PlotlyButton.preload();
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
                  id: `theme-${value.length + 1}`,
                  label: `Theme ${value.length + 1}`,
                  data: {},
                  layout: {},
                },
              ]);
              setSelectedTheme(value.length);
              e.preventDefault();
            }}
          >
            theme
          </PlotlyButton>
        </div>
        <div className="plotly-templates__list">
          <div className="plotly-templates__list--wrapper">
            {value.map((theme, index) => {
              return (
                <div className="template-group" key={theme.id}>
                  <div className="template-group__list">
                    <Theme
                      {...theme}
                      onEdit={() => {
                        setSelectedTheme(index);
                      }}
                      onDelete={() => {
                        const newValue = [...value];
                        newValue.splice(index, 1);
                        onChange(id, newValue);
                        setSelectedTheme(-1);
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {selectedTheme >= 0 && (
          <JsonEditor
            initialValue={value[selectedTheme] || {}}
            options={{
              mode: 'tree',
              schema: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                  label: {
                    type: 'string',
                  },
                  data: {
                    type: 'object',
                  },
                  layout: {
                    type: 'object',
                  },
                },
                required: ['id', 'label', 'data', 'layout'],
                additionalProperties: false,
              },
            }}
            onChange={(theme) => {
              const newValue = [...value];
              newValue[selectedTheme] = {
                ...theme,
              };
              onChange(id, newValue);
            }}
            onClose={() => setSelectedTheme(-1)}
          />
        )}
      </div>
    </div>
  );
};

export default PlotlyThemes;
