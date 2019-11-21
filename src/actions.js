import { GET_DATA_FROM_PROVIDER } from './constants.js';
import { GET_CHART_DATA_FROM_VISUALIZATION } from './constants';

export function getDataFromProvider(path) {
  return {
    type: GET_DATA_FROM_PROVIDER,
    request: {
      op: 'get',
      path: path + '?expand=connector-data',
    },
  };
}

export function getChartDataFromVisualization(path) {
  return {
    type: GET_CHART_DATA_FROM_VISUALIZATION,
    request: {
      op: 'get',
      path,
    },
  };
}
