import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Edit from './Edit';

vi.mock('semantic-ui-react', () => {
  const Modal = ({ children, open, className }) => (
    <div className={className} data-open={open}>
      {children}
    </div>
  );
  Modal.Content = ({ children, scrolling }) => (
    <div className="mock-modal-content" data-scrolling={scrolling}>
      {children}
    </div>
  );

  return {
    Button: ({ children, onClick }) => (
      <button type="button" onClick={onClick}>
        {children}
      </button>
    ),
    Modal,
  };
});

vi.mock('@plone/volto/components/manage/Sidebar/SidebarPortal', () => ({
  __esModule: true,
  default: ({ children }) => <aside className="mock-sidebar">{children}</aside>,
}));

vi.mock('@plone/volto/components/manage/Form/BlockDataForm', () => ({
  __esModule: true,
  default: (props) => (
    <form className="mock-block-data-form" data-props={props} />
  ),
}));

vi.mock('./View', () => ({
  default: (props) => <div className="mock-plotly-view" data-props={props} />,
}));

describe('PlotlyChart Edit', () => {
  beforeEach(() => {
    global.__SERVER__ = false;
  });

  it('renders editor controls, block view, and sidebar form', () => {
    const component = renderer.create(
      <Edit data={{ visualization: { data: [] } }} block="block-id" />,
    );

    expect(component.root.findByType('button').children).toEqual([
      'Open Chart Editor',
    ]);
    expect(
      component.root.findByProps({ className: 'mock-plotly-view' }).props[
        'data-props'
      ].mode,
    ).toBe('edit');
    expect(
      component.root.findByProps({ className: 'mock-block-data-form' }),
    ).toBeTruthy();
  });

  it('opens the chart editor modal and updates fields from the sidebar form', () => {
    const onChangeBlock = vi.fn();
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    const component = renderer.create(
      <Edit
        data={{ title: 'Chart', visualization: { data: [] } }}
        block="block-id"
        onChangeBlock={onChangeBlock}
      />,
    );

    act(() => {
      component.root.findByType('button').props.onClick({
        preventDefault,
        stopPropagation,
      });
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
    expect(
      component.root.findByProps({
        className: 'chart-editor-modal plotly-editor--theme-provider',
      }),
    ).toBeTruthy();

    act(() => {
      component.root
        .findByProps({ className: 'mock-block-data-form' })
        .props['data-props'].onChangeField('title', 'Updated');
    });

    expect(onChangeBlock).toHaveBeenCalledWith('block-id', {
      title: 'Updated',
      visualization: { data: [] },
    });
  });
});
