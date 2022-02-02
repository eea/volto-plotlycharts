import React, { Component } from 'react';
import { Button, Modal, Grid } from 'semantic-ui-react';

import { PickObjectWidget } from '@eeacms/volto-datablocks/components';

import ChartEditor from './ChartEditor';

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

export default PlotlyEditorModal;
