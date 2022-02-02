import React, { Component } from 'react';
import { Button, Modal, Grid } from 'semantic-ui-react';
import { SidebarPortal } from '@plone/volto/components';
import InlineForm from '@plone/volto/components/manage/Form/InlineForm';
import { PickObjectWidget } from '@eeacms/volto-datablocks/components';
import ChartEditor from '@eeacms/volto-plotlycharts/ChartEditor';

// import ConnectedChart from '@eeacms/volto-plotlycharts/ConnectedChart';

import schema from './schema';
import View from './View';

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

class Edit extends Component {
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
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      visualization: {
        chartData,
        provider_url: value.provider_url,
      },
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
    const { data = {} } = this.props;
    const { visualization = {} } = data;

    if (__SERVER__) return '';

    return (
      <>
        <div className="wrapper">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              this.setState({ showChartEditor: true });
            }}
          >
            Open Chart Editor
          </Button>
        </div>
        <View {...this.props} mode="edit" />
        {this.state.showChartEditor ? (
          <PlotlyEditorModal
            value={visualization}
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

        <SidebarPortal selected={this.props.selected}>
          <InlineForm
            schema={schema}
            title={schema.title}
            onChangeField={(id, value) => {
              this.props.onChangeBlock(this.props.block, {
                ...this.props.data,
                [id]: value,
              });
            }}
            formData={this.props.data}
          />
        </SidebarPortal>
      </>
    );
  }
}

export default Edit;
