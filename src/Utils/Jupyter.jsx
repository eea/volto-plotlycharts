import { useCallback, useEffect, useState } from 'react';
import { mapKeys } from 'lodash';
import { Button, Modal, ModalActions, ModalHeader } from 'semantic-ui-react';

let chClosed = false;

const Jupyter = (props) => {
  const { id, mode = 'view', value, onChange } = props;
  const [showPrompt, setShowPrompt] = useState(false);
  const [inIframe] = useState(__CLIENT__ && window.self !== window.top);

  const handleJupyterChSetContent = useCallback(
    (event) => {
      if (chClosed) return;
      if (mode === 'view' && event.data.type === 'jupyter-ch:setContent') {
        setShowPrompt(true);
      }
      if (mode === 'edit' && event.data.type === 'jupyter-ch:setContent') {
        mapKeys(event.data.content, (contentValue, key) => {
          if (key === id) {
            onChange(id, {
              ...(value || {}),
              chartData: {
                ...(value?.chartData || {}),
                ...(contentValue?.chartData || {}),
              },
            });
          } else {
            onChange(key, contentValue);
          }
        });
        chClosed = true;
      }
    },
    [id, mode, value, onChange],
  );

  useEffect(() => {
    if (!inIframe || chClosed) return;
    window.parent.postMessage(
      {
        type: 'jupyter-ch:getContent',
      },
      '*',
    );
  }, [inIframe]);

  useEffect(() => {
    const removeEventListener = () => {
      window.removeEventListener('message', handleJupyterChSetContent);
    };
    if (!inIframe) return;
    if (chClosed) return removeEventListener;
    window.addEventListener('message', handleJupyterChSetContent);
    return removeEventListener;
  }, [inIframe, handleJupyterChSetContent]);

  return (
    showPrompt && (
      <Modal
        onClose={() => setShowPrompt(false)}
        onOpen={() => setShowPrompt(true)}
        open={true}
      >
        <ModalHeader>Do you want to update the chart data?</ModalHeader>
        <ModalActions>
          <Button color="black" onClick={() => setShowPrompt(false)}>
            Cancel
          </Button>
          <Button
            content="Continue"
            labelPosition="right"
            icon="checkmark"
            onClick={() => {
              props.history.push(props.history.location.pathname + '/edit');
              setShowPrompt(false);
            }}
            positive
          />
        </ModalActions>
      </Modal>
    )
  );
};

export default Jupyter;
