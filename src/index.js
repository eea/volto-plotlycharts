import installAppExtras from './AppExtras';
import installBlocks from './Blocks';
import { VisualizationView } from './Views';
import {
  VisualizationWidget,
  VisualizationViewWidget,
  PlotlyTemplates,
} from './Widgets';
import { data_visualizations, preview_image } from './middlewares';
import * as addonReducers from './reducers';

import './less/global.less';

const applyConfig = (config) => {
  config.views.contentTypesViews.visualization = VisualizationView;
  config.widgets.id.visualization = VisualizationWidget;
  config.widgets.views.id.visualization = VisualizationViewWidget;
  config.widgets.widget.plotly_templates = PlotlyTemplates;

  // Add chart icon to visualization content type in /contents view
  config.settings.contentIcons.visualization = {
    attributes: {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '36',
      height: '36',
      viewBox: '0 0 36 36',
    },
    content: `<g fill-rule="evenodd"><path d="M7,29 L29,29 L29,25 L7,25 L7,29 Z M7,23 L29,23 L29,7 L7,7 L7,23 Z M5,31 L31,31 L31,5 L5,5 L5,31 Z"/><path d="M15.012 13.037L18.781 19.633 21.917 16.497 25.219 20.625 26.781 19.375 22.083 13.503 19.219 16.367 14.988 8.963 9.126 19.515 10.874 20.485z"/></g>`,
  };
  config.settings.storeExtenders = [
    ...(config.settings.storeExtenders || []),
    data_visualizations,
    preview_image,
  ];
  config.addonReducers = {
    ...config.addonReducers,
    ...addonReducers,
  };
  return [installAppExtras, installBlocks].reduce(
    (acc, apply) => apply(acc),
    config,
  );
};

export default applyConfig;
