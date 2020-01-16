import React, { Component } from 'react';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';

import { Segment } from 'semantic-ui-react'; // , Dropdown
import 'react-chart-editor/lib/react-chart-editor.css';

import { SidebarPortal } from '@plone/volto/components';

import { changeSidebarState } from 'volto-sidebar/actions';
import PickProvider from 'volto-datablocks/PickProvider';

let plotly = [];

// TODO: use setState for this
if (plotly.length === 0) {
  if (__CLIENT__) {
    import('plotly.js/dist/plotly').then(module => {
      plotly.push(module);
    });
  }
}

function getDataSourceOptions(data) {
  return Object.keys(data).map(name => ({
    value: name,
    label: name,
  }));
}

const LoadablePlotlyEditor = Loadable({
  loader: () => import('react-chart-editor'),
  loading() {
    return <div>Loading...</div>;
  },
});

const dataSources = {
  col1: [1, 2, 3], // eslint-disable-line no-magic-numbers
  col2: [4, 3, 2], // eslint-disable-line no-magic-numbers
  col3: [17, 13, 9], // eslint-disable-line no-magic-numbers
};

const config = { editable: true };

// TODO: this should be rewritten to use ModalEditor widget
class Edit extends Component {
  componentDidMount() {
    this.props.changeSidebarState(true);
  }

  componentDidUpdate(prevProps) {
    // I think this should always be true
    if (this.props.url && this.props.url !== prevProps.url) {
      this.props.changeSidebarState(true);
      // this.props.getDataFromProvider(this.props.url);
    }
  }

  render() {
    const chartData = this.props.data.chartData || {
      layout: {},
      frames: [],
      data: [],
    };
    const dataSourceOptions = getDataSourceOptions(
      this.props.providerData || dataSources,
    );

    return (
      <div>
        {__CLIENT__ && plotly.length > 0 ? (
          <div className="block selected">
            <div className="block-inner-wrapper">
              <LoadablePlotlyEditor
                data={chartData.data}
                layout={chartData.layout}
                config={config}
                frames={chartData.frames}
                dataSources={this.props.providerData || dataSources}
                dataSourceOptions={dataSourceOptions}
                plotly={plotly[0]}
                onUpdate={(data, layout, frames) => {
                  this.props.onChangeBlock(this.props.block, {
                    ...this.props.data,
                    chartData: {
                      data,
                      layout,
                      frames,
                    },
                  });
                }}
                useResizeHandler
                debug
                advancedTraceTypeSelector
              />
            </div>
            {this.props.selected ? (
              <SidebarPortal selected={true}>
                <Segment.Group raised>
                  <header className="header pulled">
                    <h2>Edit chart options</h2>
                  </header>
                  <Segment className="form sidebar-image-data">
                    <PickProvider
                      onChange={url =>
                        this.props.onChangeBlock(this.props.block, {
                          ...this.props.data,
                          url,
                        })
                      }
                      value={this.props.data?.url}
                    />
                  </Segment>
                </Segment.Group>
              </SidebarPortal>
            ) : (
              ''
            )}
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default connect(
  (state, props) => {
    const provider_url = props.data?.url
      ? `${props.data.url}/@connector-data`
      : null;
    return {
      providerData: provider_url
        ? state.data_providers.data?.[provider_url]
        : null,
    };
  },
  { changeSidebarState },
)(Edit);
