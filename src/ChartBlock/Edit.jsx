import React, { Component } from 'react';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';

import { Segment } from 'semantic-ui-react'; // , Dropdown
import 'react-chart-editor/lib/react-chart-editor.css';

import { addAppURL } from '@plone/volto/helpers';
import { searchContent } from '@plone/volto/actions';
import { DATA_PROVIDER_TYPES } from 'volto-datablocks/constants';
import { SidebarPortal, SelectWidget } from '@plone/volto/components';

import { getDataFromProvider } from 'volto-datablocks/actions';

const LoadablePlotlyEditor = Loadable({
  loader: () => import('react-chart-editor'),
  loading() {
    return <div>Loading chart editor...</div>;
  },
});

const dataSources = {
  col1: [1, 2, 3], // eslint-disable-line no-magic-numbers
  col2: [4, 3, 2], // eslint-disable-line no-magic-numbers
  col3: [17, 13, 9], // eslint-disable-line no-magic-numbers
};

function getDataSourceOptions(data) {
  return Object.keys(data).map(name => ({
    value: name,
    label: name,
  }));
}

const config = { editable: true };

class Edit extends Component {
  componentDidMount() {
    // TODO: this needs to use a subrequest
    this.props.searchContent('', {
      object_provides: DATA_PROVIDER_TYPES,
    });
    if (this.props.url) {
      this.props.getDataFromProvider(this.props.url);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.url && this.props.url !== prevProps.url) {
      this.props.getDataFromProvider(this.props.url);
    }
  }

  render() {
    const plotly = require('plotly.js/dist/plotly');
    const selectProviders = this.props.providers.map(el => {
      return [el['@id'], el.title];
    });

    const chartData = this.props.data.chartData || {
      layout: {},
      frames: [],
      data: [],
    };

    return (
      <div>
        {__CLIENT__ ? (
          <div className="block selected">
            <div className="block-inner-wrapper">
              <LoadablePlotlyEditor
                data={chartData.data}
                layout={chartData.layout}
                config={config}
                frames={chartData.frames}
                dataSources={this.props.providerData || dataSources}
                dataSourceOptions={
                  this.props.dataSourceOptions ||
                  getDataSourceOptions(dataSources)
                }
                plotly={plotly}
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
                    <SelectWidget
                      id="select-provider-url"
                      placeholder="Select..."
                      title="Data provider"
                      fluid
                      selection
                      choices={selectProviders}
                      value={this.props.data.url}
                      onChange={(id, value) =>
                        this.props.onChangeBlock(this.props.block, {
                          ...this.props.data,
                          url: value,
                        })
                      }
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

function getProviderData(state, props) {
  let path = props?.data?.url || null;

  if (!path) return;

  path = `${path}/@connector-data`;
  const url = `${addAppURL(path)}/@connector-data`;

  const data = state.data_providers.data || {};
  const res = path ? data[path] || data[url] : [];
  // console.log('res', res);
  return res;
}

export default connect(
  (state, props) => {
    const providerData = getProviderData(state, props);

    return {
      providers: state.search.items,
      providerData,
      dataSourceOptions: getDataSourceOptions(providerData || dataSources),
    };
  },
  { searchContent, getDataFromProvider },
)(Edit);
