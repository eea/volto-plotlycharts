/*
 * A wrapper around the react-chart-editor component.
 *
 */

import React, { Component } from 'react';
import { updateChartDataFromProvider } from 'volto-datablocks/helpers';

import { connect } from 'react-redux';
import 'react-chart-editor/lib/react-chart-editor.css';
import { Colorscale } from 'react-colorscales';

// TODO: remove these fallbacks;
const dataSources = {
  col1: [1, 2, 3],
  col2: [4, 3, 2],
  col3: [172121121.21, 143112121.5332, 122121.213],
};

const config = { editable: true };

const customColors = [
  { "title": "Forest Default", "colorscale": ["#215511", "#77BB12", "#CBEE66", "#ffffff", "#F4F4F1", "#000000"] },
  { "title": "Forest Active", "colorscale": ["#CA4300 ", "#E0E1E2", "#E30166", "#074F7C", "#000000", "#ffffff"] },
]

const defaultColor = customColors[0].colorscale;

function getDataSourceOptions(data) {
  return Object.keys(data).map(name => ({
    value: name,
    label: name,
  }));
}

class Edit extends Component {
  constructor(props) {
    super(props);
    this.state = {
      plotly: null,
      PlotlyEditor: null,
      showColorscalePicker: false,
      selectedColor: [],
      precision: ',f'
    };
  }
  componentDidMount() {
    import(/* webpackChunkName: 'plotlyeditor' */ 'react-chart-editor').then(
      module =>
        this.setState({ PlotlyEditor: module.default }, () =>
          import(
            /* webpackChunkName: 'plotlydist' */ 'plotly.js/dist/plotly'
          ).then(module => this.setState({ plotly: module.default }),
          ),
        ));

    this.props.onChangeValue({
      ...this.props.value,
      layout: {
        ...this.props.value.layout,
        colorway: defaultColor,
        yaxis: {
          hoverformat: this.state.precision,
        }
      },
    });
    this.setState({ selectedColor: defaultColor })
  }

  onChangeColor = (customColor) => {
    this.setState({ selectedColor: customColor })
    this.props.onChangeValue({
      ...this.props.value,
      layout: {
        ...this.props.value.layout,
        colorway: customColor
      },
    });

  }

  toggleColorscalePicker = () => {
    this.setState({ showColorscalePicker: !this.state.showColorscalePicker })
  }

  handlePrecisionSelect = (precision) => {
    this.setState({ precision })
    this.props.onChangeValue({
      ...this.props.value,
      layout: {
        ...this.props.value.layout,
        yaxis: {
          hoverformat: precision,
        }
      },
    });
  }

  render() {
    if (__SERVER__) return '';

    const dataSourceOptions = getDataSourceOptions(
      this.props.providerData || dataSources,
    );

    const updatedData = updateChartDataFromProvider(
      this.props.value?.data || [],
      [],
    );

    const { plotly, PlotlyEditor } = this.state;
    return (
      <div>
        {plotly && PlotlyEditor && (
          <div className="block selected">
            <div style={styles.contentBlock} className="block-inner-wrapper">
              <PlotlyEditor
                config={config}
                data={updatedData}
                layout={this.props.value?.layout || {}}
                frames={this.props.value?.frames || []}
                dataSourceOptions={dataSourceOptions}
                dataSources={this.props.providerData || dataSources}
                plotly={this.state.plotly}
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
              <div
                onClick={() => this.toggleColorscalePicker()}
                className="toggleButton"
                style={styles.toggleButton}
              >
                <Colorscale
                  colorscale={this.state.selectedColor}
                  width={200}
                />
                <p style={styles.title}>
                  Toggle Colorscale Picker
                  </p>
              </div>
              <div
                onClick={() => { }}
                style={styles.precisionButton}
              >
                <p style={styles.title}>
                  Set Precision
                  </p>

                <select style={styles.select} onChange={(e) => this.handlePrecisionSelect(e.target.value)}>
                  <option value=",f">.</option>
                  <option value=",.1f">.0</option>
                  <option value=",.2f">.00</option>
                  <option value=",.3f">.000</option>
                  <option value=",.4f">.0000</option>
                </select>
              </div>
              {this.state.showColorscalePicker && (
                <div style={styles.scaleItem}>
                  {customColors.map(item =>
                    <div onClick={() => { this.onChangeColor(item.colorscale) }}
                      style={{
                        cursor: 'pointer'
                      }}>
                      <p style={styles.title}>{item.title}</p>
                      <Colorscale
                        colorscale={item.colorscale}
                        width={200}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect(
  (state, props) => {
    const base = props.provider_url || props.value?.provider_url;
    const provider_url = base ? `${base}/@connector-data` : null;
    return {
      providerData: provider_url
        ? state.data_providers.data?.[provider_url]
        : null,
    };
  },
  null,
)(Edit);

const styles = {
  title: { color: "#2A3F5F" },
  scaleItem: {
    position: "absolute",
    top: "80px",
    left: "450px",
    padding: "15px",
    background: "#EAF0F8",
    border: "1px solid #C9D4E3",
    borderRadius: "5px",
    width: "20%",
  },
  toggleButton: {
    position: "absolute",
    top: 0,
    left: "450px",
    padding: "10px",
    background: "#EAF0F8",
    border: "1px solid #C9D4E3",
    borderRadius: "10px",
    cursor: 'pointer'
  },
  precisionButton: {
    position: "absolute",
    bottom: 0,
    left: "450px",
    padding: "5px",
    background: "#EAF0F8",
    border: "1px solid #C9D4E3",
    borderRadius: "10px",
  },
  contentBlock: { position: "relative" },
  select: {
    width: "100%",
    background: "white",
    borderRadius: "5px",
  }
}
