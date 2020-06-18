import { GET_CHART_DATA_FROM_VISUALIZATION } from '../constants';

const initialState = {};

export default function viz_chart_data(state = initialState, action = {}) {
  switch (action.type) {
    case `${GET_CHART_DATA_FROM_VISUALIZATION}_PENDING`:
      return {
        ...state,
        [action.path]: {
          ...state[action.path],
          error: null,
          loaded: false,
          loading: true,
          // item: null,
        },
      };
    case `${GET_CHART_DATA_FROM_VISUALIZATION}_SUCCESS`:
      console.log('action here success', action);
      return {
        ...state,
        [action.path]: {
          error: null,
          loaded: true,
          loading: false,
          item: action.result.visualization || {},
        },
      };
    case `${GET_CHART_DATA_FROM_VISUALIZATION}_FAIL`:
      return {
        ...state,
        [action.path]: {
          ...state[action.path],
          error: null,
          loaded: true,
          loading: false,
          // item: null,
        },
      };
    default:
      return state;
  }
}
