import React from 'react';
import { Button } from 'semantic-ui-react';
import { Icon } from '@plone/volto/components';

import editingIcon from '@plone/volto/icons/editing.svg';
import closeIcon from '@plone/volto/icons/clear.svg';
import checkIcon from '@plone/volto/icons/check.svg';

const ESDataWidgetActions = (props) => {
  return (
    <div>
      <Button compact size={'mini'}>
        <Icon
          name={editingIcon}
          title="Configure ES data"
          onClick={() => props.onConfigure()}
          style={{ cursor: 'pointer', marginLeft: '0.5rem' }}
        />
      </Button>
      <Button size={'mini'} compact color="red">
        <Icon
          name={closeIcon}
          title="Cancel ES data configurator"
          onClick={() => props.onCancel()}
          style={{ cursor: 'pointer', marginLeft: '0.5rem' }}
        />
      </Button>
      <Button primary compact size={'mini'}>
        <Icon
          name={checkIcon}
          title="Save data configuration"
          onClick={() => props.handleSave()}
          style={{ cursor: 'pointer', marginLeft: '0.5rem' }}
        />
      </Button>
    </div>
  );
};

export default ESDataWidgetActions;
