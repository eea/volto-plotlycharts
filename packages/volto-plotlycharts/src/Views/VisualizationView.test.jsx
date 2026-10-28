import React from 'react';
import renderer from 'react-test-renderer';
import VisualizationView from './VisualizationView';

vi.mock('semantic-ui-react', () => ({
  Container: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

vi.mock('@plone/volto/helpers/Blocks/Blocks', () => ({
  hasBlocksData: vi.fn((content) => Boolean(content.blocks_layout)),
}));

vi.mock('@plone/volto/components/theme/View/RenderBlocks', () => ({
  default: (props) => <div className="mock-render-blocks" data-props={props} />,
}));

vi.mock('@eeacms/volto-embed/helpers', () => ({
  pickMetadata: vi.fn((content) => ({ picked: content.title })),
}));

vi.mock('@eeacms/volto-plotlycharts/PlotlyComponent', () => ({
  default: (props) => (
    <div className="mock-plotly-component" data-props={props} />
  ),
}));

describe('VisualizationView', () => {
  it('renders PlotlyComponent when content has no blocks', () => {
    const content = {
      title: 'Visualization',
      visualization: { '@id': '/chart' },
      llm_summary: 'Summary',
    };
    const component = renderer.create(<VisualizationView content={content} />);
    const plotly = component.root.findByProps({
      className: 'mock-plotly-component',
    });

    expect(component.root.findByProps({ id: 'page-document' })).toBeTruthy();
    expect(plotly.props['data-props'].data).toMatchObject({
      with_sources: false,
      with_notes: false,
      with_more_info: false,
      download_button: true,
      with_enlarge: true,
      with_share: true,
      properties: { picked: 'Visualization' },
      visualization: { '@id': '/chart' },
      llm_summary: 'Summary',
    });
  });

  it('renders blocks when content has blocks data', () => {
    const component = renderer.create(
      <VisualizationView content={{ blocks_layout: { items: [] } }} />,
    );

    expect(
      component.root.findByProps({ className: 'mock-render-blocks' }),
    ).toBeTruthy();
  });
});
