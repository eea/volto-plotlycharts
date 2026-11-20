import React from 'react';
import Plot from './Plot';
import 'remixicon/fonts/remixicon.css';

export default {
  title: 'PlotlyCharts/Plot',
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

export const Default = Template.bind({});
Default.parameters = {
  controls: {
    expanded: true,
    hideNoControlsWarning: true,
  },
  docs: {
    controls: {
      sort: 'alpha',
      expanded: true,
    },
  },
};
Default.args = {
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

export const PieChartExample = Template.bind({});
PieChartExample.args = {
  with_notes: false,
  with_sources: false,
  with_more_info: true,
  download_button: true,
  with_share: true,
  with_enlarge: true,
  data: [
    {
      direction: 'counterclockwise',
      domain: {
        x: [0, 0.875],
        y: [0, 1],
      },
      hole: 0.55,
      hoverinfo: 'percent+value',
      hoverlabel: {
        align: 'right',
      },
      hovertemplate: '%{value:,D}',
      labels: [
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'High',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Good',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Unknown',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Moderate',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Poor',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
        'Bad',
      ],
      labelssrc: 'Status',
      legendgroup: '',
      meta: {
        columnNames: {
          labels: 'Status',
          text: 'Value',
          values: 'Value',
        },
      },
      mode: 'markers',
      name: '<br>',
      pull: 0,
      sort: false,
      text: [
        6653, 1541, 0, 204, 14, 0, 0, 0, 1104, 20, 87, 353, 12, 3, 0, 0, 6814,
        8, 70, 0, 30, 433, 2774, 28227, 2494, 153, 449, 117, 66, 2332, 391,
        3866, 882, 905, 3028, 240, 431, 0, 0, 16074, 347, 885, 2014, 528, 2724,
        6375, 3972, 101, 12, 4, 8, 0, 960, 0, 33, 185, 12, 751, 0, 0, 0, 2, 9,
        1185, 58, 0, 0, 47, 614, 35551, 3059, 165, 268, 69, 661, 1753, 283,
        4134, 3528, 366, 2340, 469, 562, 44, 478, 6577, 1551, 679, 912, 668,
        1406, 12156, 12246, 756, 140, 220, 7, 285, 1035, 64, 1550, 3335, 94,
        1054, 45, 164, 21, 196, 2068, 622, 249, 85, 102, 611, 1611, 7088, 227,
        89, 832, 0, 106, 1718, 6, 719, 1787, 43, 237, 10, 33, 41, 65, 846, 527,
        102, 14, 23, 244, 265,
      ],
      textfont: {
        family: 'sans-serif',
        size: 14,
      },
      textinfo: 'percent',
      textposition: 'inside',
      textsrc: 'Value',
      texttemplate: '&nbsp;%{percent:.1%}&nbsp;',
      title: {
        text: '<br>',
      },
      type: 'pie',
      values: [
        6653, 1541, 0, 204, 14, 0, 0, 0, 1104, 20, 87, 353, 12, 3, 0, 0, 6814,
        8, 70, 0, 30, 433, 2774, 28227, 2494, 153, 449, 117, 66, 2332, 391,
        3866, 882, 905, 3028, 240, 431, 0, 0, 16074, 347, 885, 2014, 528, 2724,
        6375, 3972, 101, 12, 4, 8, 0, 960, 0, 33, 185, 12, 751, 0, 0, 0, 2, 9,
        1185, 58, 0, 0, 47, 614, 35551, 3059, 165, 268, 69, 661, 1753, 283,
        4134, 3528, 366, 2340, 469, 562, 44, 478, 6577, 1551, 679, 912, 668,
        1406, 12156, 12246, 756, 140, 220, 7, 285, 1035, 64, 1550, 3335, 94,
        1054, 45, 164, 21, 196, 2068, 622, 249, 85, 102, 611, 1611, 7088, 227,
        89, 832, 0, 106, 1718, 6, 719, 1787, 43, 237, 10, 33, 41, 65, 846, 527,
        102, 14, 23, 244, 265,
      ],
      valuessrc: 'Value',
    },
  ],
  layout: {
    autosize: true,
    font: {
      family: 'sans-serif',
      size: 14,
    },
    hoverlabel: {
      font: {
        family: 'sans-serif',
        size: 13,
      },
    },
    legend: {
      font: {
        family: 'sans-serif',
        size: 14,
      },
      orientation: 'h',
      title: {
        text: '<br>',
      },
      valign: 'middle',
      x: 0.46750871080139367,
      xanchor: 'center',
      y: -0.04250000000000015,
      yanchor: 'top',
    },
    mapbox: {
      style: 'open-street-map',
    },
    margin: {
      b: 50,
      l: 60,
      r: 50,
      t: 50,
    },
    meta: [
      3165, 1541, 0, 204, 0, 0, 0, 517, 20, 353, 12, 3, 0, 6814, 8, 44, 0, 30,
      433, 20710, 2494, 153, 449, 66, 2332, 391, 3775, 882, 3028, 240, 431, 0,
      16074, 347, 856, 2014, 528, 2724, 3281, 101, 12, 4, 0, 960, 0, 32, 185,
      751, 0, 0, 2, 9, 1185, 2, 0, 0, 47, 22717, 3059, 165, 268, 661, 1753, 283,
      3953, 3528, 2340, 469, 562, 478, 6577, 1551, 661, 912, 668, 1406, 10476,
      756, 140, 220, 285, 1035, 64, 1529, 3335, 1054, 45, 164, 196, 2068, 622,
      233, 85, 102, 611, 6738, 227, 89, 832, 106, 1718, 6, 718, 1787, 237, 10,
      33, 65, 846, 527, 102, 14, 23, 244,
    ],
    metasrc: 'Value',
    piecolorway: [
      'rgb(0, 107, 184)',
      'rgb(40, 149, 136)',
      'rgb(233, 228, 232)',
      'rgb(250, 197, 13)',
      'rgb(255, 153, 51)',
      'rgb(198, 91, 89)',
    ],
    title: {
      font: {
        size: 16,
      },
      text: 'Number of surface water bodies (%)',
      x: 0.44,
    },
    xaxis: {
      autorange: true,
      hoverformat: ',.0f',
      range: [-1, 6],
      tickformat: ',.0f',
    },
    yaxis: {
      autorange: true,
      hoverformat: ',.0f',
      range: [-1, 4],
      tickformat: ',.0f',
    },
  },
};
