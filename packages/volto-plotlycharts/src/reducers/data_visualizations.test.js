import data_visualizations from './data_visualizations';
import {
  GET_VISUALIZATION,
  REMOVE_VISUALIZATION,
} from '@eeacms/volto-plotlycharts/constants';

const initialState = {
  data: {},
  error: null,
  loaded: false,
  loading: false,
  pendingVisualizations: {},
  failedVisualizations: {},
  requested: [],
};

describe('data_visualizations reducer', () => {
  it('should return the initial state by default', () => {
    expect(data_visualizations(undefined, {})).toEqual(initialState);
  });

  it('should mark a path pending on GET_VISUALIZATION_PENDING', () => {
    const state = data_visualizations(undefined, {
      type: `${GET_VISUALIZATION}_PENDING`,
      path: '/chart/@visualization',
    });

    expect(state.loading).toBe(true);
    expect(state.loaded).toBe(false);
    expect(state.error).toBe(null);
    expect(state.requested).toEqual(['/chart']);
    expect(state.pendingVisualizations).toEqual({ '/chart': true });
  });

  it('should clear a failed flag when a pending request restarts', () => {
    const prev = {
      ...initialState,
      failedVisualizations: { '/chart': true },
    };
    const state = data_visualizations(prev, {
      type: `${GET_VISUALIZATION}_PENDING`,
      path: '/chart/@visualization',
    });

    expect(state.failedVisualizations).toEqual({});
  });

  it('should store the result on GET_VISUALIZATION_SUCCESS', () => {
    const prev = {
      ...initialState,
      requested: ['/chart'],
      pendingVisualizations: { '/chart': true },
    };
    const state = data_visualizations(prev, {
      type: `${GET_VISUALIZATION}_SUCCESS`,
      path: '/chart/@visualization',
      result: { foo: 'bar' },
    });

    expect(state.loaded).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.data).toEqual({ '/chart': { foo: 'bar' } });
    expect(state.requested).toEqual([]);
    expect(state.pendingVisualizations).toEqual({});
  });

  it('should record the error and failed flag on GET_VISUALIZATION_FAIL', () => {
    const prev = {
      ...initialState,
      requested: ['/chart'],
      pendingVisualizations: { '/chart': true },
    };
    const state = data_visualizations(prev, {
      type: `${GET_VISUALIZATION}_FAIL`,
      path: '/chart/@visualization',
      error: 'boom',
    });

    expect(state.error).toBe('boom');
    expect(state.loaded).toBe(false);
    expect(state.loading).toBe(false);
    expect(state.requested).toEqual([]);
    expect(state.pendingVisualizations).toEqual({});
    expect(state.failedVisualizations).toEqual({ '/chart': true });
  });

  it('should drop stored data on REMOVE_VISUALIZATION', () => {
    const prev = {
      ...initialState,
      data: { '/chart': { foo: 'bar' }, '/other': { baz: 1 } },
    };
    const state = data_visualizations(prev, {
      type: REMOVE_VISUALIZATION,
      path: '/chart',
    });

    expect(state.data).toEqual({ '/other': { baz: 1 } });
  });

  it('should handle actions without a path', () => {
    const state = data_visualizations(undefined, {
      type: `${GET_VISUALIZATION}_PENDING`,
    });

    expect(state.requested).toEqual([undefined]);
    expect(state.pendingVisualizations).toEqual({ undefined: true });
  });
});
