import ChartEditor from './ModalEditor';
import React, { Component } from 'react';
import { Button, Modal, Form, Grid, Label } from 'semantic-ui-react';
import { map } from 'lodash';
import Loadable from 'react-loadable';

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
            onChangeValue={value => {
              this.setState({ value });
            }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button
            floated="right"
            onClick={() => this.props.onChange(this.state.value)}
          >
            Save
          </Button>
          <Button floated="right" onClick={this.props.onClose}>
            Close
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

const LoadablePlot = Loadable({
  loader: () => import('react-plotly.js'),
  loading() {
    return <div>Loading chart editor...</div>;
  },
});

class ChartWidget extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showChartEditor: false,
    };
  }

  render() {
    const {
      id,
      title,
      required,
      description,
      error,
      value,
      onChange,
      fieldSet,
    } = this.props;

    if (__SERVER__) return '';

    // value is { data || [], layout || {}, frames || [], provider_url }

    const layout = {
      ...this.props.value?.layout,
      width: this.props.value?.layout?.width || 320,
      height: this.props.value?.layout?.height || 240,
    };

    return (
      <Form.Field
        inline
        required={required}
        error={error && error.length > 0}
        className={description ? 'help' : ''}
        id={`${fieldSet || 'field'}-${id}`}
      >
        <Grid>
          <Grid.Row stretched>
            <Grid.Column width="4">
              <div className="wrapper">
                <label htmlFor={`field-${id}`}>{title}</label>
              </div>
            </Grid.Column>
            <Grid.Column width="8">
              <Button
                onClick={ev => {
                  ev.stopPropagation();
                  ev.preventDefault();
                  this.setState({ showChartEditor: true });
                }}
              >
                Open Chart Editor
              </Button>
              {this.state.showChartEditor ? (
                <ModalChartEditor
                  value={value}
                  onChange={value => {
                    onChange(id, value);
                    this.setState({
                      showChartEditor: false,
                    });
                  }}
                  onClose={() =>
                    this.setState({
                      showChartEditor: false,
                    })
                  }
                />
              ) : (
                ''
              )}
              <LoadablePlot
                data={this.props.value?.data || []}
                frames={this.props.value?.frames || []}
                layout={layout}
                config={{ displayModeBar: false }}
              />
              {map(error, message => (
                <Label key={message} basic color="red" pointing>
                  {message}
                </Label>
              ))}
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
      </Form.Field>
    );
  }
}

export default ChartWidget;
