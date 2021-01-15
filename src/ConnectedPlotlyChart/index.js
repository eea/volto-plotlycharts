import worldSVG from '@plone/volto/icons/world.svg';
import ConnectedChartBlockEdit from './ConnectedChartBlockEdit';
import ConnectedChartBlockView from './ConnectedChartBlockView';

export default (config) => {
  config.blocks.blocksConfig.connected_plotly_chart = {
    id: 'connected_plotly_chart',
    title: 'Connected Plotly Chart',
    icon: worldSVG,
    group: 'custom_addons',
    view: ConnectedChartBlockView,
    edit: ConnectedChartBlockEdit,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};
