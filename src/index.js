import { applyConfig } from './config';
import installConnectedPlotlyChart from '@eeacms/volto-plotlycharts/ConnectedPlotlyChart';
export * from './config';

function addCustomGroup(config) {
  const hasCustomGroup = config.blocks.groupBlocksOrder.filter(
    (el) => el.id === 'custom_addons',
  );
  if (hasCustomGroup.length === 0) {
    config.blocks.groupBlocksOrder.push({
      id: 'custom_addons',
      title: 'Custom addons',
    });
  }
}

export default (config) => {
  addCustomGroup(config);

  return [installConnectedPlotlyChart, applyConfig].reduce(
    (acc, apply) => apply(acc),
    config,
  );
};
