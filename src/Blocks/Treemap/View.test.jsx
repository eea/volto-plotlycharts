import React from 'react';
import renderer from 'react-test-renderer';
import View from './View';

jest.mock('./Treemap', () => (props) => (
  <div className="mock-treemap" data-props={props} />
));

jest.mock('@eeacms/volto-datablocks/hocs', () => ({
  withBlockData: (Component) => (props) => (
    <Component {...props} provider_data={{ value: [1] }} />
  ),
}));

describe('Treemap View', () => {
  it('renders Treemap with block data props', () => {
    const component = renderer.create(<View data={{ title: 'Treemap' }} />);
    const treemap = component.root.findByProps({ className: 'mock-treemap' });

    expect(treemap.props['data-props'].data).toEqual({ title: 'Treemap' });
    expect(treemap.props['data-props'].provider_data).toEqual({ value: [1] });
  });
});
