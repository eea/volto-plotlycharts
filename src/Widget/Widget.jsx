import { connect } from 'react-redux';
import ChartEditor from './ChartEditor';
import React, { Component } from 'react';
import { Button, Modal, Grid, Label } from 'semantic-ui-react';
import { map } from 'lodash';

import { getDataFromProvider } from '@eeacms/volto-datablocks/actions';
// import { connectAnythingToProviderData } from '@eeacms/volto-datablocks/hocs';
import ConnectedChart from '../ConnectedChart';
import { PickProviderWidget } from '@eeacms/volto-datablocks/components';
import { FormFieldWrapper } from '@plone/volto/components';

import './styles.css';

class ModalChartEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      providerData: null,
    };
  }

  render() {
    return (
      <Modal open={true} size="fullscreen">
        <Modal.Content scrolling>
          <ChartEditor
            value={this.state.value}
            providerData={this.state.providerData}
            onChangeValue={(value) => {
              this.setState({ value });
            }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Grid>
            <Grid.Row>
              <Grid.Column width="8">
                <PickProviderWidget
                  onChange={(id, provider_url) => {
                    this.setState({
                      value: { ...this.state.value, provider_url },
                    });
                  }}
                  onLoadProviderData={(providerData) =>
                    this.setState({ providerData })
                  }
                  value={this.state.value?.provider_url}
                  showReload={true}
                />
              </Grid.Column>
              <Grid.Column width="4">
                <Button
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
      // providerData: null,
    };
  }

  handleModalChange(value) {
    const chartData = {
      data: value.data,
      frames: value.frames,
      layout: value.layout,
      provider_url: value.provider_url,
    };
    this.props.onChange(this.props.id, {
      ...this.props.value,
      chartData,
      data: value.data,
      frames: value.frames,
      layout: value.layout,
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
      // required,
      description,
      error,
      value, // like: { data || [], layout || {}, frames || [], provider_url }
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

export default connect(
  (state, props) => {
    const provider_url = props.value?.provider_url
      ? `${props.value?.provider_url}/@connector-data`
      : null;
    return {
      providerData: provider_url
        ? state.data_providers.data?.[provider_url]
        : null,
    };
  },
  { getDataFromProvider },
)(ChartWidget);

// export default connectAnythingToProviderData(
//   (props) => props.provider_url || props.value?.provider_url,
// )(ChartWidget);
