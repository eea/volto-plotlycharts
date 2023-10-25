import React from 'react';
import cx from 'classnames';
import { Popup } from 'semantic-ui-react';
import {
  serializeNodes,
  serializeNodesToText,
} from '@plone/volto-slate/editor/render';
import { isArray } from 'lodash';

export const serializeText = (notes) => {
  if (!serializeNodesToText(notes))
    return <p>There are no notes set for this visualization</p>;
  return isArray(notes) ? serializeNodes(notes) : notes;
};

const FigureNoteWidget = ({ notes = [] }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className="plotly-notes-container">
      <Popup
        position="bottom left"
        popper={{ id: 'plotly-notes-popup' }}
        trigger={
          <button className={cx('plotly-notes-button', { expanded })}>
            Note
          </button>
        }
        on="click"
        onClose={() => {
          setExpanded(false);
        }}
        onOpen={() => {
          setExpanded(true);
        }}
      >
        <Popup.Content>{serializeText(notes)}</Popup.Content>
      </Popup>
    </div>
  );
};

export default FigureNoteWidget;
