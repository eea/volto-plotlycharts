import React, { Component } from 'react';
import { connect } from 'react-redux';

import Loadable from 'react-loadable';

import { searchContent } from '@plone/volto/actions';
import PickProvider from 'volto-datablocks/PickProvider';
import { updateChartDataFromProvider } from 'volto-datablocks/helpers';

import 'react-chart-editor/lib/react-chart-editor.css';

// TODO: unify all plotly editors to a single module
const LoadablePlotlyEditor = Loadable({
  loader: () => import('react-chart-editor'),
  loading() {
    return <div>Loading...</div>;
  },
});

let plotly = [];
if (plotly.length === 0) {
  import('plotly.js/dist/plotly').then(module => {
    plotly.push(module);
  });
}

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
  render() {
    const dataSourceOptions = getDataSourceOptions(
      this.props.providerData || dataSources,
    );

    const updatedData = updateChartDataFromProvider(
      this.props.value?.data || [],
      [],
    );

    return (
      <div>
        {__CLIENT__ && plotly.length > 0 ? (
          <div className="block selected">
            <div className="block-inner-wrapper">
              <PickProvider
                onChange={url =>
                  this.props.onChangeValue({
                    ...this.props.value,
                    provider_url: url,
                  })
                }
                value={this.props.value?.provider_url || ''}
                showReload={true}
              />
              <LoadablePlotlyEditor
                data={updatedData}
                layout={this.props.value?.layout || {}}
                config={config}
                frames={this.props.value?.frames || []}
                dataSourceOptions={dataSourceOptions}
                dataSources={this.props.providerData || dataSources}
                plotly={plotly[0]}
                onUpdate={(data, layout, frames) => {
                  return this.props.onChangeValue({
                    ...this.props.value,
                    data,
                    layout,
                    frames,
                  });
                }}
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
  { searchContent },
)(Edit);
