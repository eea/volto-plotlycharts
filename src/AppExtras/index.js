import JupyterCH from './PlotlyJupyter';

export default function applyConfig(config) {
  config.settings.appExtras = [
    ...(config.settings.appExtras || []),
    {
      match: {
        path: ['/add', '/**/add', '/edit', '/**/edit'],
      },
      component: JupyterCH,
    },
  ];

  return config;
}
