import PickVisualization from './PickVisualization';

import ChartWidget from './Widget/Widget';
import VisualizationView from './Visualization/View';

import ChartBlockEdit from './ChartBlock/ChartBlockEdit';
import ChartBlockView from './ChartBlock/ChartBlockView';

import EmbedChartBlockEdit from './EmbedChartBlock/Edit';
import EmbedChartBlockView from './EmbedChartBlock/View';

import chartIcon from '@plone/volto/icons/world.svg';
import * as addonReducers from './reducers';

export function applyConfig(config) {
  config.settings.plotlyChartsColorScale = [
    ...(config.settings.plotlyChartsColorScale || []),
    '#a6cee3',
    '#1f78b4',
    '#b2df8a',
    '#33a02c',
    '#fb9a99',
    '#e31a1c',
    '#a01a33',
    '#e3b2df',
    '#1fe31c',
    '#e378b4',
  ];

  config.views.contentTypesViews.visualization = VisualizationView;

  config.widgets.id.visualization = ChartWidget;
  config.widgets.widget.pick_visualization = PickVisualization;

  return {
    ...config,
    addonReducers: {
      ...config.addonReducers,
      ...addonReducers,
    },
  };
}

export function installBlocks(config) {
  config.blocks.blocksConfig.plotly_chart = {
    id: 'plotly_chart',
    title: 'Plotly Chart',
    view: ChartBlockView,
    edit: ChartBlockEdit,
    icon: chartIcon,
    group: 'custom_addons',
    sidebarTab: 1,
    blockHasOwnFocusManagement: true,
  };

  config.blocks.blocksConfig.embed_chart = {
    id: 'embed_chart',
    title: 'Embed Chart',
    view: EmbedChartBlockView,
    edit: EmbedChartBlockEdit,
    icon: chartIcon,
    group: 'custom_addons',
    sidebarTab: 1,
    blockHasOwnFocusManagement: true,
  };

  return config;
}
