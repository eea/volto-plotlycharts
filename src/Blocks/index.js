import { uniqBy } from 'lodash';
import installEmbedVisualization from './EmbedVisualization';
import installPlotlyChart from './PlotlyChart';
import installTreemap from './Treemap';

const config = (config) => {
  config.blocks.groupBlocksOrder = uniqBy(
    [
      ...config.blocks.groupBlocksOrder,
      { id: 'data_visualizations', title: 'Data Visualizations' },
    ],
    'id',
  );

  return [installEmbedVisualization, installPlotlyChart, installTreemap].reduce(
    (acc, apply) => apply(acc),
    config,
  );
};

export default config;
