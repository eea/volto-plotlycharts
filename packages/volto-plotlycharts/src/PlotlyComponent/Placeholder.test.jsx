import React from 'react';
import renderer from 'react-test-renderer';
import Placeholder from './Placeholder';

describe('Placeholder', () => {
  it('renders the Plotly loading placeholder SVG', () => {
    const component = renderer.create(<Placeholder />);
    const root = component.root;

    expect(root.findByProps({ className: 'plotly-placeholder' })).toBeTruthy();
    expect(root.findByType('svg').props.viewBox).toBe('0 0 240 240');
    expect(root.findAllByProps({ className: 'bar' })).toHaveLength(5);
  });
});
