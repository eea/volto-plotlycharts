import tableSVG from '@plone/volto/icons/table.svg';
import { withLoadOnVisibility } from '@eeacms/volto-plotlycharts/hocs';

const lazyView = withLoadOnVisibility(() =>
  import(/* webpackChunkName: "Plotly-blocks" */ './View'),
);
const lazyEdit = withLoadOnVisibility(() =>
  import(/* webpackChunkName: "Plotly-blocks" */ './Edit'),
);

const config = (config) => {
  config.blocks.blocksConfig.treemapChart = {
    id: 'treemapChart',
    title: 'Treemap',
    icon: tableSVG,
    group: 'data_visualizations',
    view: lazyView,
    edit: lazyEdit,
    restricted: true,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};

export default config;
