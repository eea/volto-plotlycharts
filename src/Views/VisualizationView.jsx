import React from 'react';
import { Container } from 'semantic-ui-react';
import { hasBlocksData } from '@plone/volto/helpers';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';
import { pickMetadata } from '@eeacms/volto-embed/helpers';
import ConnectedChart from '@eeacms/volto-plotlycharts/ConnectedChart';

const VisualizationView = (props) => {
  const { content = {} } = props;

  return (
    <Container id="page-document" className="view-wrapper visualization-view">
      {hasBlocksData(content) ? (
        <RenderBlocks {...props} />
      ) : (
        <div className="plotly-chart">
          <ConnectedChart
            data={{
              with_sources: false,
              with_notes: false,
              with_more_info: false,
              download_button: true,
              with_enlarge: true,
              with_share: true,
              visualization: {
                ...(props.content.visualization || {}),
                ...pickMetadata(props.content),
              },
            }}
          />
        </div>
      )}
    </Container>
  );
};

export default VisualizationView;
