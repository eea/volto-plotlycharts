import React from 'react';
import Treemap from './Treemap';
import { withBlockData } from '@eeacms/volto-datablocks/hocs';

const TreemapView = (props) => {
  const { data = {} } = props;

  return <Treemap data={data} {...props} />;
};

export default withBlockData(TreemapView);
