import { useEffect, useState } from 'react';
import cx from 'classnames';
import { PlusIcon } from 'plotly-icons';
import loadable from '@loadable/component';
import { Popup, Menu } from 'semantic-ui-react';

import { JsonEditor, ThemeIcon } from '@eeacms/volto-plotlycharts/Utils';

const PlotlyButton = loadable(() =>
  import('@eeacms/react-chart-editor/lib/components/widgets/Button'),
);

const Theme = ({ label, onEdit, onDelete, onClone }) => {
  const [open, setOpen] = useState(false);

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

const ThemesWidget = (props) => {
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
                      onClone={() => {
                        const newValue = [
                          ...value,
                          {
                            ...theme,
                            id: `${theme.id} (clone)`,
                            label: `${theme.label} (clone)`,
                          },
                        ];
                        onChange(id, newValue);
                        setSelectedTheme(newValue.length - 1);
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
              // schema: {
              //   type: 'object',
              //   properties: {
              //     id: {
              //       type: 'string',
              //     },
              //     label: {
              //       type: 'string',
              //     },
              //     hidden: {
              //       type: 'boolean',
              //       default: false,
              //     },
              //     data: {
              //       type: 'object',
              //     },
              //     layout: {
              //       type: 'object',
              //     },
              //   },
              //   required: ['id', 'label', 'data', 'layout'],
              //   additionalProperties: false,
              // },
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

export default ThemesWidget;
