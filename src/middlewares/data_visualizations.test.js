import { data_visualizations } from './data_visualizations';
import { GET_VISUALIZATION } from '@eeacms/volto-plotlycharts/constants';

const runMiddleware = (action, state) => {
  const dispatch = jest.fn();
  const next = jest.fn((a) => a);
  const store = {
    getState: () => state,
    dispatch,
  };
  const [mw] = data_visualizations([]);
  const result = mw(store)(next)(action);
  return { dispatch, next, result };
};

describe('data_visualizations middleware', () => {
  it('should append the provided middlewares', () => {
    const extra = () => {};
    const chain = data_visualizations([extra]);
    expect(chain).toHaveLength(2);
    expect(chain[1]).toBe(extra);
  });

  it('should dispatch a PENDING action and forward when not already pending', () => {
    const { dispatch, next } = runMiddleware(
      { type: GET_VISUALIZATION, path: '/chart' },
      { data_visualizations: { pendingVisualizations: {} } },
    );

    expect(dispatch).toHaveBeenCalledWith({
      type: `${GET_VISUALIZATION}_PENDING`,
      path: '/chart',
    });
    expect(next).toHaveBeenCalled();
  });

  it('should short-circuit when the path is already pending', () => {
    const { dispatch, next, result } = runMiddleware(
      { type: GET_VISUALIZATION, path: '/chart' },
      { data_visualizations: { pendingVisualizations: { '/chart': true } } },
    );

    expect(dispatch).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it('should forward unrelated actions untouched', () => {
    const action = { type: 'SOMETHING_ELSE' };
    const { dispatch, next, result } = runMiddleware(action, {
      data_visualizations: { pendingVisualizations: {} },
    });

    expect(dispatch).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(action);
    expect(result).toBe(action);
  });
});
