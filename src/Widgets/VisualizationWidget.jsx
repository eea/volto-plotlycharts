import React, { Component } from 'react';
import { Button, Modal, Grid, Label } from 'semantic-ui-react';
import { map } from 'lodash';

import { FormFieldWrapper } from '@plone/volto/components';
import { pickMetadata } from '@eeacms/volto-embed/helpers';
import { PickObjectWidget } from '@eeacms/volto-datablocks/components';

import ConnectedChart from '../ConnectedChart';
import ChartEditor from '../ChartEditor';

import './style.less';

class PlotlyEditorModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  render() {
    return (
      <Modal open={true} size="fullscreen" className="chart-editor-modal">
        <Modal.Content scrolling>
          <ChartEditor
            value={this.state.value}
            onChangeValue={(value) => {
              this.setState({ value });
            }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Grid>
            <Grid.Row>
              <Grid.Column computer={8} tablet={12} verticalAlign="middle">
                <PickObjectWidget
                  title="Select data source"
                  id="provider-data"
                  onChange={(_, provider_url) => {
                    this.setState({
                      value: { ...this.state.value, provider_url },
                    });
                  }}
                  value={this.state.value?.provider_url}
                  showReload={true}
                />
              </Grid.Column>
              <Grid.Column computer={4} tablet={12} verticalAlign="middle">
                <Button
                  primary
                  floated="right"
                  onClick={() => this.props.onChange(this.state.value)}
                >
                  Apply changes
                </Button>
                <Button floated="right" onClick={this.props.onClose}>
                  Close
                </Button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Modal.Actions>
      </Modal>
    );
  }
}

class VisualizationWidget extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showChartEditor: false,
    };
  }

  handleModalChange(value) {
    const chartData = {
      ...value.chartData,
      provider_url: value.provider_url,
    };
    this.props.onChange(this.props.id, {
      chartData,
      provider_url: value.provider_url,
    });
    this.setState({
      showChartEditor: false,
    });
  }

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
        {this.state.showChartEditor ? (
          <PlotlyEditorModal
            value={value}
            onChange={(changedValue) => this.handleModalChange(changedValue)}
            onClose={() =>
              this.setState({
                showChartEditor: false,
              })
            }
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
  }
}

export default VisualizationWidget;
