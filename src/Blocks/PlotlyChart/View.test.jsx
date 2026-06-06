import React from 'react';
import renderer from 'react-test-renderer';
import View from './View';

jest.mock('@eeacms/volto-plotlycharts/PlotlyComponent', () => (props) => (
  <div className="mock-plotly-component" data-props={props} />
));

describe('PlotlyChart View', () => {
  it('renders PlotlyComponent with default print/export options', () => {
    const component = renderer.create(
      <View data={{ title: 'Chart', with_sources: false }} />,
    );
    const plotly = component.root.findByProps({
      className: 'mock-plotly-component',
    });

    expect(
      component.root.findByProps({ className: 'plotly-chart' }),
    ).toBeTruthy();
    expect(plotly.props['data-props'].data).toMatchObject({
      title: 'Chart',
      download_button: true,
      has_data_query_by_context: true,
      with_sources: false,
    });
  });
});
