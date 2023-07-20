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
        <ConnectedChart visualization={content.visualization} />
      )}
    </Container>
  );
};

export default VisualizationView;
