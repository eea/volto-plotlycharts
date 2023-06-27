import { GET_ES_DATA } from '../constants';

export const es_data = (middlewares) => [
  (store) => (next) => (action) => {
    if (action.type === GET_ES_DATA) {
      store.dispatch({
        type: `${GET_ES_DATA}_PENDING`,
        path: action.path,
      });
    }
    return next(action);
  },
  ...middlewares,
];
