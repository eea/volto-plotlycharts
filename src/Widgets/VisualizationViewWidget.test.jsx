import React from 'react';
import renderer from 'react-test-renderer';
import VisualizationViewWidget from './VisualizationViewWidget';

jest.mock('react-redux', () => ({
  connect: (mapStateToProps) => (Component) => (props) => (
    <Component
      {...props}
      {...mapStateToProps(
        { content: { data: { title: 'State title', llm_summary: 'State' } } },
        props,
      )}
    />
  ),
}));

jest.mock('@eeacms/volto-embed/helpers', () => ({
  pickMetadata: jest.fn((content) => ({ picked: content.title })),
}));

jest.mock('@eeacms/volto-plotlycharts/PlotlyComponent', () => (props) => (
  <div className="mock-plotly-component" data-props={props} />
));

describe('VisualizationViewWidget', () => {
  it('uses provided content metadata and selected visualization value', () => {
    const component = renderer.create(
      <VisualizationViewWidget
        value={{ '@id': '/visualization' }}
        content={{ title: 'Provided title', llm_summary: 'Provided summary' }}
      />,
    );
    const plotly = component.root.findByProps({
      className: 'mock-plotly-component',
    });

    expect(plotly.props['data-props'].data).toMatchObject({
      with_sources: false,
      with_notes: false,
      with_more_info: false,
      download_button: true,
      with_enlarge: true,
      with_share: true,
      visualization: { '@id': '/visualization' },
      properties: { picked: 'Provided title' },
      llm_summary: 'Provided summary',
    });
  });

  it('falls back to content from state when content prop is missing', () => {
    const component = renderer.create(
      <VisualizationViewWidget value={{ '@id': '/visualization' }} />,
    );
    const plotly = component.root.findByProps({
      className: 'mock-plotly-component',
    });

    expect(plotly.props['data-props'].data.properties).toEqual({
      picked: 'State title',
    });
  });
});
