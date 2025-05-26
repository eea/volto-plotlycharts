import presentationSVG from '@plone/volto/icons/presentation.svg';
import { withLoadOnVisibility } from '@eeacms/volto-plotlycharts/hocs';

const lazyView = withLoadOnVisibility(() =>
  import(/* webpackChunkName: "Plotly-blocks" */ './View'),
);
const lazyEdit = withLoadOnVisibility(() =>
  import(/* webpackChunkName: "Plotly-blocks" */ './Edit'),
);

const config = (config) => {
  const visualizationBlockConfig = {
    id: 'plotly_chart',
    title: 'Plotly chart',
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
  };

  config.blocks.blocksConfig.plotly_chart = visualizationBlockConfig;
  // This is required for compatibility with previous version
  // TODO: script for migration
  config.blocks.blocksConfig.connected_plotly_chart = {
    ...visualizationBlockConfig,
    id: 'connected_plotly_chart',
    restricted: true,
  };
  return config;
};

export default config;
