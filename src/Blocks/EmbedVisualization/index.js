import presentationSVG from '@plone/volto/icons/image.svg';
import { withLoadOnVisibility } from '@eeacms/volto-plotlycharts/hocs';

const lazyView = withLoadOnVisibility(() =>
  import(/* webpackChunkName: "Plotly-blocks" */ './View'),
);
const lazyEdit = withLoadOnVisibility(() =>
  import(/* webpackChunkName: "Plotly-blocks" */ './Edit'),
);

const config = (config) => {
  const visualizationBlockConfig = {
    id: 'embed_visualization',
    title: 'Embed Chart (interactive)',
    icon: presentationSVG,
    group: 'data_visualizations',
    view: lazyView,
    edit: lazyEdit,
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
        view: lazyView,
      },
    ],
  };

  config.blocks.blocksConfig.embed_visualization = visualizationBlockConfig;

  // This is required for compatibility with previous version
  // TODO: script for migration
  config.blocks.blocksConfig.embed_chart = {
    ...visualizationBlockConfig,
    id: 'embed_chart',
    restricted: true,
  };

  return config;
};

export default config;
