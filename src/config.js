import ChartWidget from './PlotlyChart/Widget';
import VisualizationView from './Visualization/View';

export function applyConfig(config) {
  return {
    ...config,
    contentTypeViews: {
      ...config.contentTypeViews,
      visualization: VisualizationView,
    },
    widgets: {
      ...config.widgets,
      id: {
        ...config.widgets.id,
        visualization: ChartWidget,
      },
    },
  };
}
