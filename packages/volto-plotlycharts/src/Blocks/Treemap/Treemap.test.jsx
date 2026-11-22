import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Treemap from './Treemap';

vi.mock('@plone/volto/helpers/Loadable/Loadable', () => ({
  injectLazyLibs: () => (Component) => Component,
}));

vi.mock('@eeacms/volto-datablocks/hocs', () => ({
  connectToProviderData: () => (Component) => Component,
}));

vi.mock('@eeacms/volto-datablocks/components', () => ({
  VisibilitySensor: ({ children }) => children,
}));

vi.mock('@plone/volto/registry', () => ({
  default: {
    settings: {
      chartLayoutFontFamily: 'Test font',
    },
  },
}));

const Plotly = (props) => <div className="mock-plotly" data-props={props} />;

const getProps = (overrides = {}) => ({
  data: {
    label_column: 'label',
    parent_column: 'parent',
    size_column: 'size',
  },
  provider_data: {
    label: ['Child'],
    parent: ['Root'],
    size: [10],
  },
  loadingProviderData: true,
  failedProviderData: false,
  onPrintStatusChange: vi.fn(),
  plotlyMinLib: {},
  plotlyComponentFactory: () => Plotly,
  ...overrides,
});

describe('Treemap', () => {
  it('reports print readiness after provider data is rendered', () => {
    const props = getProps();
    let component;

    act(() => {
      component = renderer.create(<Treemap {...props} />);
    });

    let plotly = component.root.findByProps({ className: 'mock-plotly' });
    expect(plotly.props['data-props'].data[0]).toMatchObject({
      labels: ['Child'],
      parents: ['Root'],
      values: [10],
    });
    expect(props.onPrintStatusChange).toHaveBeenLastCalledWith('loading');

    act(() => {
      plotly.props['data-props'].onAfterPlot();
    });
    expect(props.onPrintStatusChange).toHaveBeenLastCalledWith('loading');

    act(() => {
      component.update(<Treemap {...props} loadingProviderData={false} />);
    });
    expect(props.onPrintStatusChange).toHaveBeenLastCalledWith('ready');

    act(() => {
      component.update(<Treemap {...props} loadingProviderData={true} />);
    });
    act(() => {
      component.update(<Treemap {...props} loadingProviderData={false} />);
    });
    expect(props.onPrintStatusChange).toHaveBeenLastCalledWith('loading');

    plotly = component.root.findByProps({ className: 'mock-plotly' });
    act(() => {
      plotly.props['data-props'].onAfterPlot();
    });
    expect(props.onPrintStatusChange).toHaveBeenLastCalledWith('ready');
  });

  it('reports provider failures as settled print failures', () => {
    const onPrintStatusChange = vi.fn();

    act(() => {
      renderer.create(
        <Treemap
          {...getProps({
            failedProviderData: true,
            onPrintStatusChange,
          })}
        />,
      );
    });

    expect(onPrintStatusChange).toHaveBeenLastCalledWith('failed');
  });
});
