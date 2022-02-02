import View from './View';
import Edit from './Edit';

import presentationSVG from '@plone/volto/icons/presentation.svg';

export default (config) => {
  const visualizationBlockConfig = {
    id: 'plotly_chart',
    title: 'Plotly chart',
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

  config.blocks.blocksConfig.plotly_chart = visualizationBlockConfig;
  // This is required for compatibility with previous version
  // TODO: script for migration
  config.blocks.blocksConfig.connected_plotly_chart = {
    ...visualizationBlockConfig,
    id: 'connected_plotly_chart',
  };
  return config;
};
