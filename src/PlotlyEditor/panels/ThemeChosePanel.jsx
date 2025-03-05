import { useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { EDITOR_ACTIONS } from 'react-chart-editor';
import PlotlyPanel from 'react-chart-editor/lib/components/containers/PlotlyPanel';

import { ThemeIcon } from '@eeacms/volto-plotlycharts/Utils';

function getTheme(theme) {
  return {
    id: theme.id,
    data: theme.data,
    layout: theme.layout,
  };
}

const ThemeChosePanel = (props, { ctx, fullLayout, onUpdate }) => {
  const { themes } = ctx;

  const setTheme = useCallback(
    (theme) => {
      onUpdate({
        type: EDITOR_ACTIONS.UPDATE_LAYOUT,
        payload: {
          update: {
            template: getTheme(theme),
          },
        },
      });
    },
    [onUpdate],
  );

  return (
    <PlotlyPanel {...props} style={{ height: '100%' }}>
      <div className="theme-panel--center">
        {themes.map((theme) => (
          <div
            role="button"
            tabIndex={0}
            key={theme.id}
            className={cx('theme-thumbnail', {
              selected: fullLayout.template?.id === theme.id,
            })}
            onKeyDown={() => {}}
            onClick={() => {
              setTheme(theme);
            }}
          >
            <div className="theme-thumbnail__image">
              <ThemeIcon size={200} />
            </div>
            <div className="theme-thumbnail__title">{theme.label}</div>
          </div>
        ))}
      </div>
    </PlotlyPanel>
  );
};

ThemeChosePanel.contextTypes = {
  ctx: PropTypes.object,
  onUpdate: PropTypes.func,
  fullLayout: PropTypes.object,
};

export default ThemeChosePanel;
