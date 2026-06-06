import React from 'react';
import renderer from 'react-test-renderer';
import VisualizationView from './VisualizationView';

jest.mock('semantic-ui-react', () => ({
  Container: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

jest.mock('@plone/volto/helpers/Blocks/Blocks', () => ({
  hasBlocksData: jest.fn((content) => Boolean(content.blocks_layout)),
}));

jest.mock('@plone/volto/components/theme/View/RenderBlocks', () => (props) => (
  <div className="mock-render-blocks" data-props={props} />
));

jest.mock('@eeacms/volto-embed/helpers', () => ({
  pickMetadata: jest.fn((content) => ({ picked: content.title })),
}));

jest.mock('@eeacms/volto-plotlycharts/PlotlyComponent', () => (props) => (
  <div className="mock-plotly-component" data-props={props} />
));

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
