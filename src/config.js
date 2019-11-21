import ChartWidget from './Widget/Widget';
import VisualizationView from './Visualization/View';

import PlotlyBlockEdit from './ChartBlock/Edit';
import PlotlyBlockView from './ChartBlock/View';

import EmbedChartBlockEdit from './ChartBlock/Edit';
import EmbedChartBlockView from './ChartBlock/View';

import chartIcon from '@plone/volto/icons/world.svg';
import * as addonReducers from './reducers';
import addonRoutes from './routes';

export function applyConfig(config) {
  const hasCustomGroup = config.blocks.groupBlocksOrder.filter(
    el => el.id === 'custom_addons',
  );
  if (!hasCustomGroup) {
    config.blocks.groupBlocksOrder.push({
      id: 'custom_addons',
      title: 'Custom addons',
    });
  }

  config.settings.nonContentRoutes.push('/data-providers-view');

  config.views.contentTypesViews.visualization = VisualizationView;

  config.widgets.id.viualization = ChartWidget;

  config.blocks.blocksConfig.plotly_charts = {
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
    addonReducers: {
      ...config.addonReducers,
      ...addonReducers,
    },
    addonRoutes: [...(config.addonRoutes || []), addonRoutes],
  };
}
