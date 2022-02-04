import { VisualizationView } from './Views';
import { VisualizationWidget } from './Widgets';
import installEmbedVisualization from './Blocks/EmbedVisualization';
import installPlotlyChart from './Blocks/PlotlyChart';
import installTreemap from './Blocks/Treemap';
import { data_visualizations } from './middlewares';
import * as addonReducers from './reducers';

import './less/global.less';

const applyConfig = (config) => {
  config.views.contentTypesViews.visualization = VisualizationView;
  config.widgets.id.visualization = VisualizationWidget;

  config.blocks.groupBlocksOrder = [
    ...config.blocks.groupBlocksOrder,
    {
      id: 'plotly',
      title: 'Plotly blocks',
    },
  ];

  config.settings.storeExtenders = [
    ...(config.settings.storeExtenders || []),
    data_visualizations,
  ];

  config.addonReducers = {
    ...config.addonReducers,
    ...addonReducers,
  };

  return [installEmbedVisualization, installPlotlyChart, installTreemap].reduce(
    (acc, apply) => apply(acc),
    config,
  );
};

export default applyConfig;
