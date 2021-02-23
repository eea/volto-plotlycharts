import worldSVG from '@plone/volto/icons/world.svg';
import CustomChartEdit from './Edit';
import CustomChartView from './View';

export default (config) => {
  /**
   * To add a custom chart overwrite config.blocks.blocksConfig.custom_connected_chart.charts
   * config.blocks.blocksConfig.custom_connected_chart.charts = {
   *  ...config.blocks.blocksConfig.custom_connected_chart.charts,
   *  custom_chart: {
   *    view: () => (<p>Your desired view</p>),
   *    getSchema: () => ({...schema})
   *    schema: {...schema}
   *  }
   * }
   * Use getSchema or schema, not both
   */
  config.blocks.blocksConfig.custom_connected_chart = {
    id: 'custom_connected_chart',
    title: 'Custom connected chart',
    icon: worldSVG,
    group: 'custom_addons',
    edit: CustomChartEdit,
    view: CustomChartView,
    restricted: false,
    mostUsed: false,
    sidebarTab: 1,
    charts: {},
    security: {
      addPermission: [],
      view: [],
    },
  };
  return config;
};
