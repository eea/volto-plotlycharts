/**
 * Data Providers reducer
 * @module reducers/data_providers
 */

import { GET_CHART_DATA_FROM_VISUALIZATION } from '../constants';
import { without } from 'lodash';

const initialState = {
  data: {},
  error: null,
  loaded: false,
  loading: false,
  pendingVisualizations: {},
  failedVisualizations: {},
  requested: [],
};

export default function data_providers(state = initialState, action = {}) {
  const path = action.path
    ? action.path.replace('/@field?name=visualization', '')
    : undefined;
  const pendingVisualizations = { ...state.pendingVisualizations };
  const failedVisualizations = { ...state.failedVisualizations };

  switch (action.type) {
    case `${GET_CHART_DATA_FROM_VISUALIZATION}_PENDING`:
      pendingVisualizations[path] = true;
      delete failedVisualizations[path];

      return {
        ...state,
        error: null,
        loaded: false,
        loading: true,
        requested: [...without(state.requested, path), path],
        pendingVisualizations,
        failedVisualizations,
      };

    case `${GET_CHART_DATA_FROM_VISUALIZATION}_SUCCESS`:
      delete pendingVisualizations[path];
      return {
        ...state,
        error: null,
        data: {
          ...state.data,
          [path]: action.result.visualization,
        },
        loaded: true,
        loading: false,
        requested: [...without(state.requested, path)],
        pendingVisualizations,
        failedVisualizations,
      };

    case `${GET_CHART_DATA_FROM_VISUALIZATION}_FAIL`:
      delete pendingVisualizations[path];
      failedVisualizations[path] = true;

      return {
        ...state,
        error: action.error,
        data: { ...state.data },
        loaded: false,
        loading: false,
        // TODO: retry get?
        requested: [...without(state.requested, path)],
        pendingVisualizations,
        failedVisualizations,
      };

    default:
      return state;
  }
}
