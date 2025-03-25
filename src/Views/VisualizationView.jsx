import React from 'react';
import { Container } from 'semantic-ui-react';
import { hasBlocksData } from '@plone/volto/helpers';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';
import { pickMetadata } from '@eeacms/volto-embed/helpers';
import PlotlyComponent from '@eeacms/volto-plotlycharts/PlotlyComponent';

const VisualizationView = (props) => {
  const { content = {} } = props;

  return (
    <Container id="page-document" className="view-wrapper visualization-view">
      {hasBlocksData(content) ? (
        <RenderBlocks {...props} />
      ) : (
        <div className="plotly-chart">
          <PlotlyComponent
            data={{
              with_sources: false,
              with_notes: false,
              with_more_info: false,
              download_button: true,
              with_enlarge: true,
              with_share: true,
              properties: pickMetadata(props.content),
              visualization: props.content.visualization,
            }}
          />
        </div>
      )}
    </Container>
  );
};

export default VisualizationView;
