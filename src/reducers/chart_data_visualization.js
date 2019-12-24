import { GET_CHART_DATA_FROM_VISUALIZATION } from '../constants';

const initialState = {
  error: null,
  item: {},
  loaded: false,
  loading: false,
};

export default function viz_chart_data(state = initialState, action = {}) {
  switch (action.type) {
    case `${GET_CHART_DATA_FROM_VISUALIZATION}_PENDING`:
      return {
        ...state,
        error: null,
        loaded: false,
        loading: true,
      };
    case `${GET_CHART_DATA_FROM_VISUALIZATION}_SUCCESS`:
      console.debug(
        'Success getting chart data from viz',
        action.result.visualization,
      );
      return {
        ...state,
        error: null,
        data: action.result.visualization || {},
        loaded: true,
        loading: false,
      };
    case `${GET_CHART_DATA_FROM_VISUALIZATION}_FAIL`:
      return {
        ...state,
        error: action.error,
        item: {},
        loaded: false,
        loading: false,
      };
    default:
      return state;
  }
}
