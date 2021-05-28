import React, { Component } from 'react';
import { Button, Modal, Grid, Label } from 'semantic-ui-react';
import { map, omit } from 'lodash';

import { FormFieldWrapper } from '@plone/volto/components';

import { PickProviderWidget } from 'volto-datablocks/components';
import ChartEditor from '@eeacms/volto-plotlycharts/Widget/ChartEditor';

import ConnectedChart from './ConnectedChart';

import './styles.css';

class ModalChartEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };
  }

  render() {
    return (
      <Modal open={true} size="fullscreen">
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
              <Grid.Column computer={8} tablet={12}>
                <PickProviderWidget
                  title="Select data source"
                  onChange={(id, provider_url) => {
                    this.setState({
                      value: { ...this.state.value, provider_url },
                    });
                  }}
                  value={this.state.value?.provider_url}
                  showReload={true}
                />
              </Grid.Column>
              <Grid.Column computer={4} tablet={12}>
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

class ChartWidget extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showChartEditor: false,
    };
  }

  handleModalChange(value) {
    // value is like: {
    //   data: value.data,
    //   frames: value.frames,
    //   layout: value.layout,
    //   provider_url: value.provider_url,
    // };
    this.props.onChange(this.props.id, {
      ...omit(
        // Fix BBB
        {
          ...this.props.value,
          ...value,
        },
        ['chartData'],
      ),
      provider_url: value.provider_url,
    });
    this.setState({
      showChartEditor: false,
    });
  }

  render() {
    const {
      id,
      title,
      description,
      error,
      value, // like: { data || [], layout || {}, frames || [], provider_url }
      // required,
      // onChange,
      // fieldSet,
    } = this.props;

    if (__SERVER__) return '';

    const layout = {
      ...this.props.value?.layout,
      width: this.props.value?.layout?.width || 320,
      height: this.props.value?.layout?.height || 240,
    };
    return (
      <FormFieldWrapper {...this.props} columns={1}>
        <Grid>
          <Grid.Row stretched>
            <Grid.Column width="12">
              <div className="wrapper">
                <label htmlFor={`field-${id}`}>{title}</label>

                <Button
                  floated="right"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    ev.preventDefault();
                    this.setState({ showChartEditor: true });
                  }}
                >
                  Open Chart Editor
                </Button>
              </div>
            </Grid.Column>
            <Grid.Column width="8">
              <div></div>
            </Grid.Column>
          </Grid.Row>
          {description && (
            <Grid.Row stretched>
              <Grid.Column stretched width="12">
                <p className="help">{description}</p>
              </Grid.Column>
            </Grid.Row>
          )}
        </Grid>

        {this.state.showChartEditor ? (
          <ModalChartEditor
            value={value}
            onChange={(changedValue) => this.handleModalChange(changedValue)}
            onClose={() =>
              this.setState({
                showChartEditor: false,
              })
            }
          />
        ) : (
          <ConnectedChart
            data={{ chartData: this.props.value }}
            frames={this.props.value?.frames || []}
            layout={layout}
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

export default ChartWidget;

// export default connectAnythingToProviderData(
//   (props) => props.provider_url || props.value?.provider_url,
// )(ChartWidget);
//
// import { connectAnythingToProviderData } from 'volto-datablocks/hocs';
