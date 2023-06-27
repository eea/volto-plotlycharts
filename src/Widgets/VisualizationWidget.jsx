import React from 'react';
import { Button, Modal, Grid, Label, Select } from 'semantic-ui-react';
import { map } from 'lodash';

import { PickObjectWidget } from '@eeacms/volto-datablocks/components';
import { FormFieldWrapper } from '@plone/volto/components';

import ConnectedChart from '../ConnectedChart';
import ChartEditor from '../ChartEditor';

import './style.less';
import ESDataWidgetActions from './ESDataWidgetActions';
import ESDataWidgetBody from './ESDataWidget';

const dataSourceOptions = [
  { key: 'connector', value: 'connector', text: 'connector' },
  { key: 'elastic-search', value: 'elastic-search', text: 'elastic-search' },
];

const PlotlyEditorModal = (props) => {
  const [value, setValue] = React.useState(props?.value);
  const [queryESData, setQueryESData] = React.useState(false);

  const [dataSource, setDataSource] = React.useState(
    dataSourceOptions[0].value,
  );

  const handleESActionsCancel = () => {
    setQueryESData(false);
    //should also reset data builded
  };

  const handleESDataSave = () => {
    //should set data from datawidget body in state to value
    //preprocess data maybe
  };

  return (
    <Modal open={true} size="fullscreen" className="chart-editor-modal">
      <Modal.Content scrolling>
        {(dataSource && dataSource === 'connector') || !queryESData ? (
          <ChartEditor
            value={value}
            onChangeValue={(value) => {
              setValue(value);
            }}
          />
        ) : (
          <ESDataWidgetBody />
        )}
      </Modal.Content>
      <Modal.Actions className="plotly-modal-action">
        <Grid>
          <Grid.Row>
            <Grid.Column
              computer={8}
              tablet={12}
              largeScreen={8}
              verticalAlign="middle"
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <p style={{ marginBottom: '0px', marginRight: '5px' }}>
                  Select data from
                </p>
                <Select
                  placeholder="Select"
                  options={dataSourceOptions}
                  value={dataSource}
                  onChange={(e, { value }) => setDataSource(value)}
                />
                {dataSource && dataSource === 'connector' ? (
                  <PickObjectWidget
                    title="Select data source"
                    id="provider-data"
                    onChange={(_, provider_url) => {
                      setValue({ ...value, provider_url });
                    }}
                    value={value?.provider_url}
                    showReload={true}
                  />
                ) : (
                  <ESDataWidgetActions
                    onConfigure={() => setQueryESData(true)}
                    onCancel={() => handleESActionsCancel()}
                    onSave={() => {
                      handleESDataSave();
                    }}
                  />
                )}
              </div>
            </Grid.Column>
            <Grid.Column computer={4} tablet={12} verticalAlign="middle">
              <Button
                primary
                floated="left"
                onClick={() => props.onChange(value)}
              >
                Apply changes
              </Button>
              <Button floated="right" onClick={props.onClose}>
                Close
              </Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Modal.Actions>
    </Modal>
  );
};

const VisualizationWidget = (props) => {
  const [showChartEditor, setShowChartEditor] = React.useState(false);

  const handleModalChange = (value) => {
    const chartData = {
      ...value.chartData,
      provider_url: value.provider_url,
    };
    props.onChange(props.id, {
      chartData,
      provider_url: value.provider_url,
    });
    setShowChartEditor(false);
  };

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

  const { id, title, description, error, value } = props;

  if (__SERVER__) return '';

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
      {showChartEditor ? (
        <PlotlyEditorModal
          value={value}
          onChange={(changedValue) => handleModalChange(changedValue)}
          onClose={() => setShowChartEditor(false)}
        />
      ) : (
        ''
      )}
      {map(error, (message) => (
        <Label key={message} basic color="red" pointing>
          {message}
        </Label>
      ))}
    </FormFieldWrapper>
  );
};

export default VisualizationWidget;
