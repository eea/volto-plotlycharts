import React from 'react';
import renderer from 'react-test-renderer';
import View from './View';

jest.mock('@eeacms/volto-plotlycharts/PlotlyComponent', () => (props) => (
  <div className="mock-plotly-component" data-props={props} />
));

describe('EmbedVisualization View', () => {
  it('passes embedded visualization defaults to PlotlyComponent', () => {
    const component = renderer.create(
      <View
        mode="preview"
        data={{
          title: 'Embedded chart',
          properties: { llm_summary: 'Summary' },
        }}
      />,
    );
    const plotly = component.root.findByProps({
      className: 'mock-plotly-component',
    });

    expect(
      component.root.findByProps({ className: 'embed-visualization view' }),
    ).toBeTruthy();
    expect(plotly.props['data-props']).toMatchObject({ mode: 'preview' });
    expect(plotly.props['data-props'].data).toMatchObject({
      title: 'Embedded chart',
      download_button: true,
      has_data_query_by_context: true,
      with_sources: true,
      llm_summary: 'Summary',
    });
  });
});
