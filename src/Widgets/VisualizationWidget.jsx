import React, { useState, Component } from 'react';
import { Button, Modal, Grid, Label } from 'semantic-ui-react';
import { map } from 'lodash';

import config from '@plone/volto/registry';
import { FormFieldWrapper } from '@plone/volto/components';
import { pickMetadata } from '@eeacms/volto-embed/helpers';

import PlotlyJsonModal from './PlotlyJsonModal';
import ConnectedChart from '../ConnectedChart';
import ChartEditor from '../ChartEditor';

import './style.less';

const PlotlyEditorModal = (props) => {
  const [value, setValue] = useState(props.value);
  const [showImportJSON, setShowImportJSON] = useState(false);

  const InternalUrlWidget = config.widgets.widget.internal_url;

  return (
    <>
      <Modal open={true} size="fullscreen" className="chart-editor-modal">
        <Modal.Content scrolling>
          <ChartEditor
            value={value}
            onChangeValue={(value) => {
              setValue(value);
            }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Grid>
            <Grid.Row>
              <Grid.Column computer={7} tablet={12} verticalAlign="middle">
                <InternalUrlWidget
                  title="Select data source"
                  id="provider-data"
                  onChange={(_, provider_url) => {
                    setValue((value) => ({
                      ...value,
                      provider_url,
                      use_live_data: true,
                    }));
                  }}
                  value={value.provider_url}
                  showReload={true}
                />
              </Grid.Column>
              <Grid.Column
                computer={5}
                tablet={12}
                verticalAlign="middle"
                style={{
                  display: 'inline-flex',
                  flexFlow: 'row',
                  justifyContent: 'space-between',
                }}
              >
                <Button floated="right" onClick={() => setShowImportJSON(true)}>
                  JSON
                </Button>
                <div style={{ display: 'flex' }}>
                  <Button floated="right" onClick={props.onClose}>
                    Close
                  </Button>
                  <Button
                    primary
                    floated="right"
                    onClick={() => {
                      props.onChange(props.id, value);
                      props.onClose();
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Actions>
      </Modal>
      {showImportJSON && (
        <PlotlyJsonModal
          updateChartData={(data) => {
            setValue((value) => ({
              ...value,
              json_data: data,
              use_live_data: true,
            }));
          }}
          chartData={value.chartData}
          jsonData={value.json_data}
          onClose={() => setShowImportJSON(false)}
        />
      )}
    </>
  );
};

class VisualizationWidget extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showChartEditor: false,
    };
  }

  // This is the structure of value
  // value = {
  //   chartData: {
  //     data: data || [],
  //     layout: layout || {},
  //     frames: frames || [],
  //   }
  //   provider_url: provider_url
  //   json_data: json_data
  //   use_live_data: use_live_data
  // }

  render() {
    const { id, title, description, error, value } = this.props;

    if (__SERVER__) return '';

    return (
      <FormFieldWrapper {...this.props} columns={1}>
        <div className="wrapper">
          <label htmlFor={`field-${id}`}>{title}</label>
          <Button
            floated="right"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.setState({ showChartEditor: true });
            }}
          >
            Open Chart Editor
          </Button>
        </div>
        {description && <p className="help">{description}</p>}
        <ConnectedChart
          data={{
            with_sources: false,
            with_notes: false,
            with_more_info: false,
            download_button: false,
            with_enlarge: false,
            with_share: false,
            visualization: {
              ...(value || {}),
              ...pickMetadata(this.props.formData || {}),
            },
          }}
        />
        {this.state.showChartEditor && (
          <PlotlyEditorModal
            {...this.props}
            value={value}
            onClose={() =>
              this.setState({
                showChartEditor: false,
              })
            }
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
}

export default VisualizationWidget;
