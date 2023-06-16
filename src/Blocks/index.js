import installEmbedVisualization from './EmbedVisualization';
import installPlotlyChart from './PlotlyChart';
import installTreemap from './Treemap';

export default (config) => {
  return [installEmbedVisualization, installPlotlyChart, installTreemap].reduce(
    (acc, apply) => apply(acc),
    config,
  );
};
