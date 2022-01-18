import { GET_CHART_DATA_FROM_VISUALIZATION } from '../constants';

export const data_visualizations = (middlewares) => [
  (store) => (next) => (action) => {
    const state = store.getState();
    if (action.type === GET_CHART_DATA_FROM_VISUALIZATION) {
      const isPending =
        state.data_visualizations.pendingVisualizations[action.path];
      if (isPending) {
        return;
      }
      store.dispatch({
        type: `${GET_CHART_DATA_FROM_VISUALIZATION}_PENDING`,
        path: action.path,
      });
    }
    return next(action);
  },
  ...middlewares,
];
