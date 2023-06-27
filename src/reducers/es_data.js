import { GET_ES_DATA } from '../constants';

const initialState = {
  data: {},
  error: null,
  loaded: false,
  loading: false,
};

export default function es_data(state = initialState, action = {}) {
  console.log(action?.type, 'action type');
  switch (action.type) {
    case `${GET_ES_DATA}_PENDING`:
      console.log('request pending');

      return {
        ...state,
        error: null,
        loaded: false,
        loading: true,
      };

    case `${GET_ES_DATA}_SUCCESS`:
      console.log('request success', action.result);
      return {
        ...state,
        error: null,
        data: {
          ...state.data,
          //maybe save it with the id of the viz that requested it
          [action.path]: action.result,
        },
        loaded: true,
        loading: false,
      };

    case `${GET_ES_DATA}_FAIL`:
      console.log('request fail');

      return {
        ...state,
        error: action.error,
        data: { ...state.data },
        loaded: false,
        loading: false,
      };

    default:
      return state;
  }
}
