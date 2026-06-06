import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Edit from './Edit';

jest.mock('redux', () => ({
  compose:
    (...fns) =>
    (value) =>
      fns.reduceRight((acc, fn) => fn(acc), value),
}));

jest.mock('@eeacms/volto-datablocks/hocs', () => ({
  connectToProviderData: () => (Component) => (props) => (
    <Component
      {...props}
      provider_data={props.provider_data ?? { size: [1], label: ['A'] }}
    />
  ),
}));

jest.mock('@plone/volto/components/manage/Sidebar/SidebarPortal', () => ({
  __esModule: true,
  default: ({ children }) => <aside className="mock-sidebar">{children}</aside>,
}));

jest.mock('@plone/volto/components/manage/Form/BlockDataForm', () => ({
  __esModule: true,
  default: (props) => (
    <form className="mock-block-data-form" data-props={props} />
  ),
}));

jest.mock('./View', () => (props) => (
  <div className="mock-treemap-view" data-props={props} />
));

describe('Treemap Edit', () => {
  it('renders TreemapView and builds schema choices from provider data', () => {
    const component = renderer.create(
      <Edit data={{ url: '/data' }} block="block-id" />,
    );
    const form = component.root.findByProps({
      className: 'mock-block-data-form',
    });

    expect(
      component.root.findByProps({ className: 'mock-treemap-view' }),
    ).toBeTruthy();
    expect(
      form.props['data-props'].schema.properties.size_column.choices,
    ).toEqual([
      ['size', 'size'],
      ['label', 'label'],
    ]);
  });

  it('updates block data from the sidebar form', () => {
    const onChangeBlock = jest.fn();
    const component = renderer.create(
      <Edit
        data={{ url: '/data' }}
        block="block-id"
        onChangeBlock={onChangeBlock}
      />,
    );
    const form = component.root.findByProps({
      className: 'mock-block-data-form',
    });

    act(() => {
      form.props['data-props'].onChangeField('size_column', 'size');
    });

    expect(onChangeBlock).toHaveBeenCalledWith('block-id', {
      url: '/data',
      size_column: 'size',
    });
  });
});
