import React, { Component } from 'react';
import { connect } from 'react-redux';

import Loadable from 'react-loadable';

import { searchContent } from '@plone/volto/actions';
import PickProvider from 'volto-datablocks/PickProvider';

import 'react-chart-editor/lib/react-chart-editor.css';

// TODO: unify all plotly editors to a single module
const LoadablePlotlyEditor = Loadable({
  loader: () => import('react-chart-editor'),
  loading() {
    return <div>Loading...</div>;
  },
});

// TODO: remove these fallbacks;
const dataSources = {
  col1: [1, 2, 3],
  col2: [4, 3, 2],
  col3: [17, 13, 9],
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
      providerData: null,
    };
  }

  render() {
    const dataSourceOptions = getDataSourceOptions(
      this.state.providerData || dataSources,
    );
    return (
      <div>
        {__CLIENT__ ? (
          <div className="block selected">
            <div className="block-inner-wrapper">
              <PickProvider
                onLoadProviderData={providerData =>
                  this.setState({ providerData })
                }
                onChange={url =>
                  this.props.onChangeValue({
                    ...this.props.value,
                    provider_url: url,
                  })
                }
                value={this.props.value?.provider_url || ''}
                currentProviderData={this.state.providerData}
              />
              <LoadablePlotlyEditor
                data={this.props.value?.data || []}
                layout={this.props.value?.layout || {}}
                config={config}
                frames={this.props.value?.frames || []}
                dataSourceOptions={dataSourceOptions}
                dataSources={this.state.providerData || dataSources}
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

export default connect(
  null,
  { searchContent },
)(Edit);
