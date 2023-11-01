import React from 'react';
import { Container } from 'semantic-ui-react';
import ConnectedChart from '../ConnectedChart';
import { hasBlocksData } from '@plone/volto/helpers';
import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';

const VisualizationView = (props) => {
  const { content = {} } = props;

  return (
    <Container id="page-document" className="view-wrapper visualization-view">
      {hasBlocksData(content) ? (
        <RenderBlocks {...props} />
      ) : (
        <div className="plotly-chart">
          <ConnectedChart
            visualization={content.visualization}
            data={{
              with_sources: false,
              with_notes: false,
              with_more_info: false,
              download_button: false,
              with_enlarge: false,
              with_share: false,
            }}
          />
        </div>
      )}
    </Container>
  );
};

export default VisualizationView;
