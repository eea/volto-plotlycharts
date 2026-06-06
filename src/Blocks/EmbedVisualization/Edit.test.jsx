import React from 'react';
import renderer, { act } from 'react-test-renderer';
import Edit from './Edit';

jest.mock('semantic-ui-react', () => ({
  Message: ({ children }) => <div className="mock-message">{children}</div>,
}));

jest.mock('@plone/volto/components/manage/Sidebar/SidebarPortal', () => ({
  __esModule: true,
  default: ({ children, selected }) => (
    <aside className="mock-sidebar" data-selected={selected}>
      {children}
    </aside>
  ),
}));

jest.mock('@plone/volto/components/manage/Form/BlockDataForm', () => ({
  __esModule: true,
  default: (props) => (
    <form className="mock-block-data-form" data-props={props} />
  ),
}));

jest.mock('@eeacms/volto-plotlycharts/PlotlyComponent', () => (props) => (
  <div className="mock-plotly-component" data-props={props} />
));

describe('EmbedVisualization Edit', () => {
  it('shows a message until a visualization is selected', () => {
    const component = renderer.create(
      <Edit data={{}} block="block-id" onChangeBlock={jest.fn()} />,
    );

    expect(
      component.root.findByProps({ className: 'mock-message' }),
    ).toBeTruthy();
    expect(
      component.root.findByProps({ className: 'mock-block-data-form' }),
    ).toBeTruthy();
  });

  it('renders PlotlyComponent and updates block data from the sidebar form', () => {
    const onChangeBlock = jest.fn();
    const component = renderer.create(
      <Edit
        selected
        block="block-id"
        data={{ vis_url: '/visualization', with_notes: false }}
        onChangeBlock={onChangeBlock}
      />,
    );
    const plotly = component.root.findByProps({
      className: 'mock-plotly-component',
    });
    const form = component.root.findByProps({
      className: 'mock-block-data-form',
    });

    expect(plotly.props['data-props'].mode).toBe('edit');
    expect(plotly.props['data-props'].data).toMatchObject({
      vis_url: '/visualization',
      download_button: true,
      has_data_query_by_context: true,
      with_sources: true,
      with_more_info: true,
      with_notes: false,
    });

    act(() => {
      form.props['data-props'].onChangeField('title', 'Updated');
    });

    expect(onChangeBlock).toHaveBeenCalledWith('block-id', {
      vis_url: '/visualization',
      with_notes: false,
      title: 'Updated',
    });
  });
});
