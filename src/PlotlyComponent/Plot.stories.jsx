import React from 'react';
import Plot from './Plot';

export default {
  title: 'VoltoPlotlyCharts/Plot',
  component: Plot,
  argTypes: {
    data: { control: 'object' },
    layout: { control: 'object' },
  },
};

const Template = (args) => <Plot {...args} onInitialized={() => {}} />;

export const Playground = Template.bind({});
Playground.args = {
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
