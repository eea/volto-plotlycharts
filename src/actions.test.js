import { getVisualization, removeVisualization } from './actions';
import { GET_VISUALIZATION, REMOVE_VISUALIZATION } from './constants';

describe('plotlycharts actions', () => {
  it('creates a visualization request action', () => {
    expect(getVisualization('/chart')).toEqual({
      type: GET_VISUALIZATION,
      path: '/chart',
      request: {
        op: 'get',
        path: '/chart/@visualization',
      },
    });
  });

  it('creates a remove visualization action', () => {
    expect(removeVisualization('/chart')).toEqual({
      type: REMOVE_VISUALIZATION,
      path: '/chart',
    });
  });
});
