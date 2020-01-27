import { GET_CHART_DATA_FROM_VISUALIZATION } from './constants';

export function getChartDataFromVisualization(path) {
  return {
    type: GET_CHART_DATA_FROM_VISUALIZATION,
    path,
    request: {
      op: 'get',
      path: `${path}/@field?name=visualization`,
    },
  };
}
