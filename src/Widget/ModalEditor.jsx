import Loadable from 'react-loadable';
import React, { Component } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { connect } from 'react-redux';

import { addAppURL } from '@plone/volto/helpers';
import { getDataFromProvider } from 'volto-datablocks/actions';
import { searchContent } from '@plone/volto/actions';

import 'react-chart-editor/lib/react-chart-editor.css';

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
  // constructor(props) {
  //   super(props);
  //
  //   console.log('chart editor props', props);
  //   const chartData = props.value || {};
  //
  //   // this.state = {
  //   //   data: chartData.data || [],
  //   //   layout: chartData.layout || {},
  //   //   frames: chartData.frames || [],
  //   //   provider_url: '',
  //   // };
  //
  //   // this.onSubmit = this.onSubmit.bind(this);
  //   // this.handleChange = this.handleChange.bind(this);
  //   // this.handleChangeProvider = this.handleChangeProvider.bind(this);
  // }

  // onSubmit() {
  //   // const chartData = {
  //   //   data: this.state.data,
  //   //   layout: this.state.layout,
  //   //   frames: this.state.frames,
  //   // };
  //   const url = this.state.provider_url;
  //   this.props.onChangeValue(chartData, url);
  // }

  // handleChange(data, layout, frames) {
  //   this.setState({ data, layout, frames }, this.onSubmit);
  // }

  // handleChangeProvider(ev, { value }) {
  //   this.props.getDataFromProvider(value);
  // }

  componentDidMount() {
    // TODO: this needs to use a subrequest
    this.props.searchContent('', {
      object_provides: 'eea.restapi.interfaces.IBasicDataProvider',
    });
  }

  render() {
    const plotly = require('plotly.js/dist/plotly');
    const selectProviders = this.props.providers.map(el => {
      return {
        key: el['@id'],
        text: el.title,
        value: el['@id'],
      };
    });

    return (
      <div>
        {__CLIENT__ ? (
          <div className="block selected">
            <div className="block-inner-wrapper">
              <Dropdown
                placeholder="Select data provider"
                fluid
                selection
                options={selectProviders}
                onChange={(ev, { value }) =>
                  this.props.onChangeValue({ ...this.props.value, url: value })
                }
              />
              <LoadablePlotlyEditor
                data={this.props.value?.data || []}
                layout={this.props.value?.layout || {}}
                config={config}
                frames={this.props.value?.frames || []}
                dataSources={this.props.providerData || dataSources}
                dataSourceOptions={
                  this.props.dataSourceOptions ||
                  getDataSourceOptions(dataSources)
                }
                plotly={plotly}
                onUpdate={data =>
                  this.props.onChangeValue({ ...this.props.value, data })
                }
                useResizeHandler
                debug
                advancedTraceTypeSelector
              />
            </div>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

function getProviderData(state, props) {
  // state.data_providers ? state.data_providers.item : {};
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
