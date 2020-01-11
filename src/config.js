import ChartWidget from './Widget/Widget';
import VisualizationView from './Visualization/View';

import PlotlyBlockEdit from './ChartBlock/Edit';
import PlotlyBlockView from './ChartBlock/View';

import EmbedChartBlockEdit from './EmbedChartBlock/Edit';
import EmbedChartBlockView from './EmbedChartBlock/View';

import chartIcon from '@plone/volto/icons/world.svg';
// import * as addonReducers from './reducers';

function addCustomGroup(config) {
  const hasCustomGroup = config.blocks.groupBlocksOrder.filter(
    el => el.id === 'custom_addons',
  );
  if (hasCustomGroup.length === 0) {
    config.blocks.groupBlocksOrder.push({
      id: 'custom_addons',
      title: 'Custom addons',
    });
  }
}

export function applyConfig(config) {
  addCustomGroup(config);

  config.views.contentTypesViews.visualization = VisualizationView;

  config.widgets.id.visualization = ChartWidget;

  config.blocks.blocksConfig.plotly_chart = {
    id: 'plotly_chart',
    title: 'Plotly Chart',
    view: PlotlyBlockView,
    edit: PlotlyBlockEdit,
    icon: chartIcon,
    group: 'custom_addons',
  };
  config.blocks.blocksConfig.embed_chart = {
    id: 'embed_chart',
    title: 'Embed Chart',
    view: EmbedChartBlockView,
    edit: EmbedChartBlockEdit,
    icon: chartIcon,
    group: 'custom_addons',
  };

  return {
    ...config,
    // addonReducers: {
    //   ...config.addonReducers,
    //   ...addonReducers,
    // },
  };
}
