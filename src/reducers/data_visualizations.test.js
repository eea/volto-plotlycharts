import reducer from './data_visualizations';
import { GET_VISUALIZATION, REMOVE_VISUALIZATION } from '../constants';

describe('data_visualizations reducer', () => {
  it('tracks pending visualization requests', () => {
    const state = reducer(undefined, {
      type: `${GET_VISUALIZATION}_PENDING`,
      path: '/chart/@visualization',
    });

    expect(state.loading).toBe(true);
    expect(state.pendingVisualizations).toEqual({ '/chart': true });
    expect(state.requested).toEqual(['/chart']);
  });

  it('stores loaded visualizations and removes pending state', () => {
    const state = reducer(
      {
        data: {},
        pendingVisualizations: { '/chart': true },
        failedVisualizations: {},
        requested: ['/chart'],
      },
      {
        type: `${GET_VISUALIZATION}_SUCCESS`,
        path: '/chart/@visualization',
        result: { title: 'Chart' },
      },
    );

    expect(state.loaded).toBe(true);
    expect(state.loading).toBe(false);
    expect(state.data).toEqual({ '/chart': { title: 'Chart' } });
    expect(state.pendingVisualizations).toEqual({});
  });

  it('marks failed requests and removes stored visualizations', () => {
    const failed = reducer(
      {
        data: { '/chart': { title: 'Old chart' } },
        pendingVisualizations: { '/chart': true },
        failedVisualizations: {},
        requested: ['/chart'],
      },
      {
        type: `${GET_VISUALIZATION}_FAIL`,
        path: '/chart/@visualization',
        error: 'Failed',
      },
    );

    expect(failed.error).toBe('Failed');
    expect(failed.failedVisualizations).toEqual({ '/chart': true });

    const removed = reducer(failed, {
      type: REMOVE_VISUALIZATION,
      path: '/chart',
    });

    expect(removed.data).toEqual({});
  });
});
