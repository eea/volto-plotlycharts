import installEmbedEEAVisualization from './EmbedEEAVisualization';
import installPlotlyChart from './PlotlyChart';
import installTreemap from './Treemap';

export default (config) => {
  return [
    installEmbedEEAVisualization,
    installPlotlyChart,
    installTreemap,
  ].reduce((acc, apply) => apply(acc), config);
};
