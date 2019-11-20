import { GET_DATA_FROM_PROVIDER } from './constants.js';

export function getDataFromProvider(path) {
  return {
    type: GET_DATA_FROM_PROVIDER,
    request: {
      op: 'get',
      path: path + '?expand=connector-data',
    },
  };
}
