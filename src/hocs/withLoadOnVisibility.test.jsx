import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { MemoryRouter } from 'react-router-dom';
import withLoadOnVisibility from './withLoadOnVisibility';

jest.mock('@loadable/component', () => () => {
  return function MockLoadedComponent() {
    return <div data-testid="loaded-chart">Loaded chart</div>;
  };
});

const LoadedOnVisibility = withLoadOnVisibility(() => Promise.resolve());

const createTestStore = (initialState) =>
  createStore((state = initialState, action) => {
    if (action.type === 'SET_PRINT') {
      return { ...state, print: { isPrint: action.value } };
    }
    return state;
  });

const renderComponent = ({ state = {}, route = '/' } = {}) => {
  const store = createTestStore(state);
  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <LoadedOnVisibility block="chart-1" />
      </MemoryRouter>
    </Provider>,
  );
  return { ...result, store };
};

describe('withLoadOnVisibility', () => {
  let intersectionCallback;

  beforeEach(() => {
    intersectionCallback = undefined;
    global.IntersectionObserver = class IntersectionObserver {
      constructor(callback) {
        intersectionCallback = callback;
      }

      observe() {}

      unobserve() {}
    };
  });

  afterEach(() => {
    delete global.IntersectionObserver;
  });

  it('keeps normal off-screen charts lazy when no print reducer exists', () => {
    renderComponent();

    expect(screen.queryByTestId('loaded-chart')).not.toBeInTheDocument();
  });

  it('loads a normal chart when it intersects the viewport', async () => {
    renderComponent();

    await act(async () => {
      intersectionCallback([{ isIntersecting: true }]);
    });

    expect(screen.getByTestId('loaded-chart')).toBeInTheDocument();
  });

  it('loads immediately when print mode is initially active', async () => {
    renderComponent({ state: { print: { isPrint: true } } });

    expect(await screen.findByTestId('loaded-chart')).toBeInTheDocument();
  });

  it('loads when an existing page enters print mode', async () => {
    const { store } = renderComponent({
      state: { print: { isPrint: false } },
    });

    expect(screen.queryByTestId('loaded-chart')).not.toBeInTheDocument();

    await act(async () => {
      store.dispatch({ type: 'SET_PRINT', value: true });
    });

    expect(await screen.findByTestId('loaded-chart')).toBeInTheDocument();
  });

  it('still supports disabling the visibility sensor by query string', async () => {
    renderComponent({ route: '/?visibility_sensor=off' });

    expect(await screen.findByTestId('loaded-chart')).toBeInTheDocument();
  });
});
