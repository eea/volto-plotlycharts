import React from 'react';
import cx from 'classnames';
import { Popup } from 'semantic-ui-react';

import './style.css';

const NotesWidget = ({ notes }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="plotly-notes-container">
      <Popup
        content={notes}
        position="bottom left"
        popper={{ id: 'plotly-notes-popup' }}
        trigger={
          <button className={cx('plotly-notes-button', { expanded })}>
            Notes
          </button>
        }
        on="click"
        onClose={() => {
          setExpanded(false);
        }}
        onOpen={() => {
          setExpanded(true);
        }}
      />
    </div>
  );
};

export default NotesWidget;
