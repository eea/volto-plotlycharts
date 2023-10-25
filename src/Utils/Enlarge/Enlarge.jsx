import React, { useState } from 'react';
import { Modal, Button } from 'semantic-ui-react';
import fullscreenIcon from '@plone/volto/icons/fullscreen.svg';
import { Icon } from '@plone/volto/components';

const EnlargeWidget = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="plotly-enlarge-container">
      <button className="plotly-enlarge-button" onClick={() => setIsOpen(true)}>
        Enlarge {` `}
        <Icon name={fullscreenIcon} size="24px" />
      </button>
      <Modal
        open={isOpen}
        closeIcon
        onClose={() => setIsOpen(false)}
        className="plotly-enlarge-modal"
      >
        <Modal.Content>{children}</Modal.Content>
        <Modal.Actions>
          {' '}
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default EnlargeWidget;
