import ChartWidget from './PlotlyChart/Widget';

export function applyConfig(config) {
  return {
    ...config,
    widgets: {
      ...config.widgets,
      id: {
        ...config.widgets.id,
        visualization: ChartWidget,
      },
    },
  };
}
