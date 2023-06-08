import React from 'react';
import { Container } from 'semantic-ui-react';
import ConnectedChart from '../ConnectedChart';

const VisualizationView = (props) => {
  const { content = {} } = props;

  return (
    <Container id="page-document">
      <ConnectedChart visualization={content.visualization} />
    </Container>
  );
};

export default VisualizationView;
