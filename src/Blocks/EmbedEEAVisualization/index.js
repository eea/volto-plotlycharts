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
    variations: [
      {
        id: 'default',
        title: 'Default',
        isDefault: true,
        view: View,
      },
      {
        id: 'extra',
        title: 'Extra (expand if needed)',
        isDefault: false,
        view: View,
      },
    ],
  };

  config.blocks.blocksConfig.embed_eea_visualization = visualizationBlockConfig;

  return config;
};
