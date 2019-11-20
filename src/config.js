import ChartWidget from './Widget/Widget';
import VisualizationView from './Visualization/View';

import PlotlyBlockEdit from './Block/Edit';
import PlotlyBlockView from './Block/View';

import chartIcon from '@plone/volto/icons/world.svg';

export function applyConfig(config) {
  config.contentTypeViews.visualization = VisualizationView;
  config.widgets.id.viualization = ChartWidget;
  config.blocks.blocksConfig.plotly_charts = {
    id: 'plotly_chart',
    title: 'Plotly Chart',
    view: PlotlyBlockView,
    edit: PlotlyBlockEdit,
    icon: chartIcon,
    group: 'custom_addons',
  };

  return config;
}
