import React, { useState, Component } from 'react';
import { Button, Modal, Grid } from 'semantic-ui-react';
import config from '@plone/volto/registry';
import { SidebarPortal, BlockDataForm } from '@plone/volto/components';
import ChartEditor from '@eeacms/volto-plotlycharts/ChartEditor';
import PlotlyJsonModal from '@eeacms/volto-plotlycharts/Widgets/PlotlyJsonModal';

import schema from './schema';
import View from './View';

import '@eeacms/volto-plotlycharts/less/plotly.less';

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
                      use_data_sources: true,
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
                      props.onChange(value);
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
              use_data_sources: true,
            }));
          }}
          jsonData={value.json_data}
          onClose={() => setShowImportJSON(false)}
        />
      )}
    </>
  );
};

class Edit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showChartEditor: false,
    };

    this.onChange = this.onChange.bind(this);
  }

  onChange(value) {
    this.props.onChangeBlock(this.props.block, {
      ...this.props.data,
      visualization: value,
    });
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
  //   use_data_sources: use_data_sources
  // }

  render() {
    const { block, data = {} } = this.props;
    const { visualization = {} } = data;

    if (__SERVER__) return '';

    return (
      <div style={{ position: 'relative', zIndex: 1 }}>
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
        {this.state.showChartEditor && (
          <PlotlyEditorModal
            value={visualization}
            onChange={this.onChange}
            onClose={() =>
              this.setState({
                showChartEditor: false,
              })
            }
          />
        )}
        <SidebarPortal selected={this.props.selected}>
          <BlockDataForm
            block={block}
            title={schema.title}
            schema={schema}
            onChangeBlock={this.props.onChangeBlock}
            onChangeField={(id, value) => {
              this.props.onChangeBlock(this.props.block, {
                ...data,
                [id]: value,
              });
            }}
            formData={data}
          />
        </SidebarPortal>
      </div>
    );
  }
}

export default Edit;
