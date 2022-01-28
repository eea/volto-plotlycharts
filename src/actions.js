import { GET_VISUALIZATION, REMOVE_VISUALIZATION } from './constants';

export function getVisualization(path, use_live_data) {
  return {
    type: GET_VISUALIZATION,
    path,
    use_live_data,
    request: {
      op: 'get',
      path: `${path}/@${
        use_live_data ? 'visualization-layout' : 'visualization'
      }`,
    },
  };
}

export function removeVisualization(path) {
  return {
    type: REMOVE_VISUALIZATION,
    path,
  };
}
