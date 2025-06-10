import React from 'react';
import Plot from './Plot';
import 'remixicon/fonts/remixicon.css';

export default {
  title: 'VoltoPlotlyCharts/Plot',
  component: Plot,
  argTypes: {
    data: {
      control: 'object',
      description: 'Plotly chart data configuration',
      table: {
        type: {
          summary: 'object',
        },
        defaultValue: {
          summary: '[]',
        },
      },
    },
    layout: {
      control: 'object',
      description: 'Plotly chart layout configuration',
      table: {
        type: {
          summary: 'object',
        },
        defaultValue: {
          summary: '{}',
        },
      },
    },
    // Boolean controls from EmbedVisualization schema
    with_notes: {
      control: 'boolean',
      description: 'Show notes section below the chart',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'true',
        },
      },
    },
    with_sources: {
      control: 'boolean',
      description: 'Show sources section from page Data provenance',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'true',
        },
      },
    },
    with_more_info: {
      control: 'boolean',
      description: 'Show more info section',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'true',
        },
      },
    },
    download_button: {
      control: 'boolean',
      description: 'Show download button in toolbar',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'true',
        },
      },
    },
    with_share: {
      control: 'boolean',
      description: 'Show share button in toolbar',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'true',
        },
      },
    },
    with_enlarge: {
      control: 'boolean',
      description: 'Show enlarge button in toolbar',
      table: {
        type: {
          summary: 'boolean',
        },
        defaultValue: {
          summary: 'true',
        },
      },
    },
  },
};

// Mock toolbar component for Storybook (no external dependencies)
const MockToolbar = ({ toolbarProps }) => {
  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#3d5265',
    border: 'none',
    backgroundColor: 'transparent',
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
      }}
    >
      <div>
        {toolbarProps.with_notes && (
          <button
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#3d5265',
              border: 'none',
              backgroundColor: 'transparent',
            }}
          >
            Notes
          </button>
        )}
        {toolbarProps.with_sources && (
          <button style={buttonStyle}>Sources</button>
        )}
        {toolbarProps.with_more_info && (
          <button style={buttonStyle}>More Info</button>
        )}
      </div>
      <div style={{ display: 'flex' }}>
        {toolbarProps.download_button && (
          <button style={buttonStyle}>
            <i className="ri-download-fill" style={{ marginRight: '5px' }}></i>
            Download
          </button>
        )}
        {toolbarProps.with_share && (
          <button style={buttonStyle}>
            <i className="ri-share-fill" style={{ marginRight: '5px' }}></i>
            Share
          </button>
        )}
        {toolbarProps.with_enlarge && (
          <button style={buttonStyle}>
            <i
              className="ri-fullscreen-line"
              style={{ marginRight: '5px' }}
            ></i>
            Enlarge
          </button>
        )}
      </div>
    </div>
  );
};

const PlotWithToolbar = (args) => {
  const { data, layout, ...toolbarProps } = args;

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: '4px' }}>
      <div style={{ height: '400px', padding: '10px' }}>
        <Plot data={data} layout={layout} onInitialized={() => {}} />
      </div>
      <MockToolbar toolbarProps={toolbarProps} />
    </div>
  );
};

const Template = (args) => <PlotWithToolbar {...args} />;

export const Playground = Template.bind({});
// Playground.parameters = {
//   controls: {
//     expanded: true,
//     hideNoControlsWarning: true,
//   },
//   docs: {
//     controls: {
//       sort: 'alpha',
//       expanded: true,
//     },
//   },
// };
Playground.args = {
  with_notes: true,
  with_sources: true,
  with_more_info: true,
  download_button: true,
  with_share: true,
  with_enlarge: true,
  data: [
    {
      hoverinfo: 'y',
      hovertemplate: '%{text:,d}',
      meta: {
        columnNames: {
          text: 'waterBodies',
          x: 'percentage',
          y: 'status',
        },
      },
      mode: 'markers',
      name: '<br>',
      orientation: 'h',
      text: [116812, 5069, 12355, 34393, 19391, 45604],
      textfont: {
        color: 'rgb(68, 68, 68)',
        family: 'sans-serif',
        size: 13,
      },
      textposition: 'outside',
      textsrc: 'waterBodies',
      texttemplate: '&nbsp;%{x:.1f}%',
      transforms: [
        {
          enabled: true,
          meta: {
            columnNames: {
              target: 'status',
            },
          },
          operation: '!=',
          target: [
            'Total',
            'Bad',
            'Poor',
            'Moderate',
            'Unknown',
            'High or good',
          ],
          targetsrc: 'status',
          type: 'filter',
          value: 'Total',
        },
      ],
      type: 'bar',
      x: [100, 4.3, 10.6, 29.4, 16.6, 39],
      xsrc: 'percentage',
      y: ['Total', 'Bad', 'Poor', 'Moderate', 'Unknown', 'High or good'],
      ysrc: 'status',
    },
  ],
  layout: {
    autosize: true,
    bargap: 0.32,
    bargroupgap: 0,
    barmode: 'group',
    barnorm: '',
    colorway: [
      '#1f77b4',
      '#ff7f0e',
      '#2ca02c',
      '#d62728',
      '#9467bd',
      '#8c564b',
      '#e377c2',
      '#7f7f7f',
      '#bcbd22',
      '#17becf',
      'black',
    ],
    dragmode: 'select',
    font: { family: 'sans-serif', size: 14 },
    hoverlabel: { font: { family: 'sans-serif', size: 13 } },
    mapbox: { style: 'open-street-map' },
    margin: { b: 50, l: 85, pad: 0, r: 10, t: 20 },
    showlegend: false,
    xaxis: {
      autorange: false,
      exponentformat: 'none',
      gridcolor: 'rgb(205, 198, 198)',
      nticks: 5,
      range: [0, 44],
      showline: false,
      tickfont: { family: 'sans-serif', size: 13 },
      ticksuffix: '%',
      title: {
        font: { family: 'sans-serif', size: 13 },
        text: 'Proportion (%) of number of surface water bodies',
      },
      type: 'linear',
    },
    yaxis: {
      autorange: true,
      range: [-0.5, 4.5],
      showline: true,
      tickfont: { family: 'sans-serif', size: 13 },
      title: { font: { family: 'sans-serif', size: 16 } },
      type: 'category',
    },
  },
};
