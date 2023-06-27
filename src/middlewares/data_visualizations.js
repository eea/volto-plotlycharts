import { GET_ES_DATA, GET_VISUALIZATION } from '../constants';

export const data_visualizations = (middlewares) => [
  (store) => (next) => (action) => {
    const state = store.getState();
    if (action.type === GET_VISUALIZATION) {
      const isPending =
        state.data_visualizations.pendingVisualizations[action.path];
      if (isPending) {
        return;
      }
      store.dispatch({
        type: `${GET_VISUALIZATION}_PENDING`,
        path: action.path,
      });
    }
    //move into it's own middleware TODO:
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
