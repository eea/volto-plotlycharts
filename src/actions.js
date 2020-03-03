import { GET_CHART_DATA_FROM_VISUALIZATION } from './constants';
import { CHANGE_SIDEBAR_STATE } from './constants';

export function changeSidebarState(open) {
  return {
    type: CHANGE_SIDEBAR_STATE,
    open,
  };
}

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
