import { GET_VISUALIZATION, REMOVE_VISUALIZATION } from './constants';

export function getVisualization(path) {
  return {
    type: GET_VISUALIZATION,
    path,
    request: {
      op: 'get',
      path: `${path}/@visualization`,
    },
  };
}

export function removeVisualization(path) {
  return {
    type: REMOVE_VISUALIZATION,
    path,
  };
}
