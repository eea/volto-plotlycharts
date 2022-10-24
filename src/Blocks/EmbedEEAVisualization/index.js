import View from './View';
import Edit from './Edit';

import presentationSVG from '@plone/volto/icons/presentation.svg';

export default (config) => {
  const visualizationBlockConfig = {
    id: 'embed_eea_visualization',
    title: 'Embed EEA visualization',
    icon: presentationSVG,
    group: 'plotly',
    view: View,
    edit: Edit,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };

  config.blocks.blocksConfig.embed_eea_visualization = visualizationBlockConfig;
  // This is required for compatibility with previous version
  // TODO: script for migration
  // config.blocks.blocksConfig.embed_chart = {
  //   ...visualizationBlockConfig,
  //   id: 'embed_chart',
  // };
  return config;
};
