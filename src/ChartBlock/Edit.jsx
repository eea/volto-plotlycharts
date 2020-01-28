import React, { Component } from 'react';
import { connect } from 'react-redux';
import Loadable from 'react-loadable';
import { Field } from '@plone/volto/components'; // EditBlock

import { Segment } from 'semantic-ui-react'; // , Dropdown
import 'react-chart-editor/lib/react-chart-editor.css';
import { TextWidget } from '@plone/volto/components';
import { Button } from 'semantic-ui-react';

import { SidebarPortal } from '@plone/volto/components';

import { changeSidebarState } from 'volto-sidebar/actions';
import PickProvider from 'volto-datablocks/PickProvider';

function getDataSourceOptions(data) {
  return Object.keys(data).map(name => ({
    value: name,
    label: name,
  }));
}

// const LoadablePlotlyEditor = Loadable({
//   loader: () => import('react-chart-editor'),
//   loading() {
//     return <div>Loading...</div>;
//   },
// });

const dataSources = {
  col1: [1, 2, 3], // eslint-disable-line no-magic-numbers
  col2: [4, 3, 2], // eslint-disable-line no-magic-numbers
  col3: [17, 13, 9], // eslint-disable-line no-magic-numbers
};

const config = { editable: true };

// TODO: this should be rewritten to use ModalEditor widget
class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      LoadablePlotlyEditor: false,
      plotly: null,
    };
  }
  componentDidMount() {
    this.props.changeSidebarState(true);

    import(
      /* webpackChunkName: 'LoadablePlotlyEditor' */ 'react-chart-editor'
    ).then(module => this.setState({ LoadablePlotlyEditor: module.default }));

    import(/* webpackChunkName: 'plotlydist' */ 'plotly.js/dist/plotly').then(
      module => this.setState({ plotly: module.default }),
    );
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

    const LoadablePlotlyEditor = this.state.LoadablePlotlyEditor;

    return (
      <div>
        {__CLIENT__ && this.state.plotly && LoadablePlotlyEditor ? (
          <div className="block selected">
            <div className="block-inner-wrapper">
              <LoadablePlotlyEditor
                data={chartData.data}
                layout={chartData.layout}
                config={config}
                frames={chartData.frames}
                dataSources={this.props.providerData || dataSources}
                dataSourceOptions={dataSourceOptions}
                plotly={this.state.plotly}
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
                    <Field
                      title="Source"
                      id="chart-source"
                      type="text"
                      value={this.props.data.chart_source || ''}
                      required={false}
                      onChange={(e, d) =>
                        this.props.onChangeBlock(this.props.block, {
                          ...this.props.data,
                          chart_source: d,
                        })
                      }
                    />
                    <Field
                      title="Source Link"
                      id="chart-source-link"
                      type="text"
                      value={this.props.data.chart_source_link || ''}
                      required={false}
                      onChange={(e, d) =>
                        this.props.onChangeBlock(this.props.block, {
                          ...this.props.data,
                          chart_source_link: d,
                        })
                      }
                    />
                    {this.props.data.chartSources &&
                    this.props.data.chartSources.length
                      ? this.props.data.chartSources.map((item, index) => (
                          <React.Fragment>
                            <TextWidget
                              title="Source"
                              id={`chart-source_${index}`}
                              type="text"
                              value={item.chart_source}
                              required={false}
                              onChange={(e, d) => {
                                const dataClone = JSON.parse(
                                  JSON.stringify(this.props.data.chartSources),
                                );
                                dataClone[index].chart_source = d;
                                this.props.onChangeBlock(this.props.block, {
                                  ...this.props.data,
                                  chartSources: dataClone,
                                });
                              }}
                            />
                            <TextWidget
                              title="Source Link"
                              id={`chart-source_link_${index}`}
                              type="text"
                              value={item.chart_source_link}
                              required={false}
                              onChange={(e, d) => {
                                const dataClone = JSON.parse(
                                  JSON.stringify(this.props.data.chartSources),
                                );
                                dataClone[index].chart_source_link = d;
                                this.props.onChangeBlock(this.props.block, {
                                  ...this.props.data,
                                  chartSources: dataClone,
                                });
                              }}
                            />
                          </React.Fragment>
                        ))
                      : ''}
                    <Button
                      primary
                      onClick={() => {
                        const chartSources =
                          this.props.data.chartSources &&
                          this.props.data.chartSources.length
                            ? JSON.parse(
                                JSON.stringify(this.props.data.chartSources),
                              )
                            : [];
                        chartSources.push({
                          chart_source_link: '',
                          chart_source: '',
                        });
                        this.props.onChangeBlock(this.props.block, {
                          ...this.props.data,
                          chartSources: chartSources,
                        });
                      }}
                    >
                      Add source
                    </Button>
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
