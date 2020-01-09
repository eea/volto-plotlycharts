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
  constructor(props) {
    super(props);
    this.state = {
      plotly: require('plotly.js/dist/plotly'),
    };
  }

  componentDidMount() {
    // TODO: this needs to use a subrequest
    this.props.searchContent('', {
      object_provides: 'eea.restapi.interfaces.IBasicDataProvider',
    });
  }

  componentDidUpdate(prevProps) {
    const url = this.props.value?.provider_url;
    const prevUrl = prevProps.value?.provider_url;
    if (url !== prevUrl) this.props.getDataFromProvider(url);
  }

  render() {
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
                  this.props.onChangeValue({
                    ...this.props.value,
                    provider_url: value,
                  })
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
                plotly={this.state.plotly}
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
  let path = props?.value?.provider_url || null;

  if (!path) return;

  path = `${path}/@connector-data`;
  const url = `${addAppURL(path)}/@connector-data`;

  const data = state.data_providers.data || {};
  const res = path ? data[path] || data[url] : [];
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
