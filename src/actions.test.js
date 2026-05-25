import { getVisualization, removeVisualization } from './actions';
import { GET_VISUALIZATION, REMOVE_VISUALIZATION } from './constants';

describe('actions', () => {
  describe('getVisualization', () => {
    it('should build a GET_VISUALIZATION request action', () => {
      expect(getVisualization('/path/to/chart')).toEqual({
        type: GET_VISUALIZATION,
        path: '/path/to/chart',
        request: {
          op: 'get',
          path: '/path/to/chart/@visualization',
        },
      });
    });
  });

  describe('removeVisualization', () => {
    it('should build a REMOVE_VISUALIZATION action', () => {
      expect(removeVisualization('/path/to/chart')).toEqual({
        type: REMOVE_VISUALIZATION,
        path: '/path/to/chart',
      });
    });
  });
});
