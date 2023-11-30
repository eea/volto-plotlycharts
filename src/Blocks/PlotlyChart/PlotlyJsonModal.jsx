import React from 'react';
import { Button, Modal, TextArea, Message } from 'semantic-ui-react';
import { defineMessages, injectIntl, useIntl } from 'react-intl';

function isValidJson(json) {
  try {
    JSON.parse(json);
    return true;
  } catch (e) {
    return false;
  }
}

const messages = defineMessages({
  invalidJSONError: {
    id: 'Please add a valid JSON.',
    defaultMessage: 'Please add a valid JSON.',
  },
});

const PlotlyJsonModal = (props) => {
  const intl = useIntl();
  const { updateChartData } = props;
  const [open, setOpen] = React.useState(false);
  const [jsonData, setJsonData] = React.useState('');
  const [invalidJSONError, setInvalidJSONError] = React.useState([]);

  return (
    <Modal
      size="fullscreen"
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      open={open}
      trigger={<Button floated="left">Import JSON</Button>}
    >
      <Modal.Header>Add Plotly JSON</Modal.Header>
      <Modal.Content>
        <TextArea
          className="json-textarea"
          style={{ minHeight: 500 }}
          value={jsonData}
          placeholder="Paste your Plotly JSON here..."
          onChange={(e, { value }) => setJsonData(value)}
        ></TextArea>

        {invalidJSONError.length > 0 && (
          <Message negative>
            <p>{invalidJSONError}</p>
          </Message>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => setOpen(false)}>Close</Button>
        <Button
          primary
          content="Apply"
          onClick={() => {
            if (isValidJson(jsonData)) {
              updateChartData(JSON.parse(jsonData));
              setInvalidJSONError([]);
              setJsonData('');
              setOpen(false);
            } else {
              setInvalidJSONError([
                intl.formatMessage(messages.invalidJSONError),
              ]);
              setTimeout(() => setInvalidJSONError([]), 5000);
            }
          }}
        />
      </Modal.Actions>
    </Modal>
  );
};

export default injectIntl(PlotlyJsonModal);
