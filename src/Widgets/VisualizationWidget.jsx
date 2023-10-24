import React from 'react';
import { Button, Modal, Grid, Label } from 'semantic-ui-react';
import { map } from 'lodash';

import { PickObjectWidget } from '@eeacms/volto-datablocks/components';
import { FormFieldWrapper } from '@plone/volto/components';
import { flattenToAppURL } from '@plone/volto/helpers';

import { withServerOnly } from '@eeacms/volto-plotlycharts/Utils';

import ConnectedChart from '../ConnectedChart';
import ChartEditor from '../ChartEditor';

import './style.less';

export function PlotlyEditorModal(props) {
  const { value, onClose, onChange } = props;
  const [storedValue, setStoredValue] = React.useState(value);

  return (
    <Modal open={true} size="fullscreen" className="chart-editor-modal">
      <Modal.Content scrolling>
        <ChartEditor value={storedValue} onChangeValue={setStoredValue} />
      </Modal.Content>
      <Modal.Actions>
        <Grid>
          <Grid.Row>
            <Grid.Column computer={8} tablet={12} verticalAlign="middle">
              <PickObjectWidget
                title="Select data source"
                id="provider-data"
                onChange={(_, provider_url) => {
                  setStoredValue({
                    chartData: { ...storedValue?.chartData, provider_url },
                    provider_url,
                  });
                }}
                value={flattenToAppURL(
                  storedValue?.provider_url ??
                    storedValue?.chartData?.provider_url ??
                    '',
                )}
                showReload={true}
              />
            </Grid.Column>
            <Grid.Column computer={4} tablet={12} verticalAlign="middle">
              <Button
                primary
                floated="right"
                onClick={() => onChange(storedValue)}
              >
                Apply changes
              </Button>
              <Button floated="right" onClick={onClose}>
                Close
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Modal.Actions>
    </Modal>
  );
}

function VisualizationWidget(props) {
  const { id, title, description, error, value, onChange } = props;
  const [showChartEditor, setShowChartEditor] = React.useState(false);

  // This is the structure of value
  // value = {
  //   chartData: {
  //     data: data || [],
  //     layout: layout || {},
  //     frames: frames || [],
  //     provider_url: provider_url || undefined
  //   }
  //   provider_url: provider_url
  // }

  const handleModalChange = React.useCallback(
    (value) => {
      const chartData = {
        ...value.chartData,
        provider_url: value.provider_url,
      };
      onChange(id, {
        chartData,
        provider_url: value.provider_url,
      });
      setShowChartEditor(false);
    },
    [onChange, id],
  );

  return (
    <FormFieldWrapper {...props} columns={1}>
      <div className="wrapper">
        <label htmlFor={`field-${id}`}>{title}</label>
        <Button
          floated="right"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowChartEditor(true);
          }}
        >
          Open Chart Editor
        </Button>
      </div>
      {description && <p className="help">{description}</p>}
      <ConnectedChart visualization={value} />
      {showChartEditor && (
        <PlotlyEditorModal
          value={value}
          onChange={handleModalChange}
          onClose={() => setShowChartEditor(false)}
        />
      )}
      {map(error, (message) => (
        <Label key={message} basic color="red" pointing>
          {message}
        </Label>
      ))}
    </FormFieldWrapper>
  );
}

export default withServerOnly(VisualizationWidget);
