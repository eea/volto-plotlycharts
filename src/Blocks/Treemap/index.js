import tableSVG from '@plone/volto/icons/table.svg';
import TreemapView from './View';
import TreemapEdit from './Edit';

export default (config) => {
  config.blocks.blocksConfig.treemapChart = {
    id: 'treemapChart',
    title: 'Treemap',
    icon: tableSVG,
    group: 'data_visualizations',
    view: TreemapView,
    edit: TreemapEdit,
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
